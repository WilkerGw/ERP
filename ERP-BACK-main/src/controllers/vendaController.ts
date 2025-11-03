// Caminho: ERP-BACK-main/src/controllers/vendaController.ts

import { Request, Response } from 'express';
import Venda from '../models/Venda';
import Produto from '../models/Produto';
import Cliente from '../models/Cliente';
import OrdemServico from '../models/OrdemServico';
import mongoose from 'mongoose';

/**
 * Função auxiliar para obter o próximo número de Ordem de Serviço.
 */
async function getNextNumeroOS(session: mongoose.ClientSession) {
  console.log('[LOG] Buscando o último número de OS...');
  const ultimaOS = await OrdemServico.findOne().sort({ numeroOS: -1 }).session(session);
  const proximoNumero = (ultimaOS?.numeroOS || 0) + 1;
  console.log(`[LOG] Última OS: ${ultimaOS?.numeroOS || 'Nenhuma'}. Próximo número: ${proximoNumero}`);
  return proximoNumero;
}

// --- LÓGICA DE CRIAÇÃO DE VENDA E O.S. COM LOGS ---
export const createVenda = async (req: Request, res: Response) => {
  console.log('[LOG] Iniciando processo de criação de venda...');
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { cliente: clienteId, produtos, pagamento } = req.body;
    console.log(`[LOG] Venda para o cliente ID: ${clienteId}`);

    // 1. Validação de Estoque
    console.log('[LOG] Validando estoque dos produtos...');
    for (const item of produtos) {
      const produtoDB = await Produto.findById(item.produto).session(session);
      if (!produtoDB) {
        throw new Error(`Produto com ID ${item.produto} não encontrado.`);
      }
      if (produtoDB.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto: ${produtoDB.nome}. Disponível: ${produtoDB.estoque}`);
      }
    }
    console.log('[LOG] Estoque validado com sucesso.');

    // 2. Cálculo do Valor Total e Criação da Venda
    const valorTotal = produtos.reduce((acc: number, item: any) => acc + (item.quantidade * item.valorUnitario), 0);
    const novaVenda = new Venda({ cliente: clienteId, produtos, valorTotal, pagamento, status: 'Pendente' });
    await novaVenda.save({ session });
    console.log(`[LOG] Venda ${novaVenda._id} salva com sucesso.`);

    // 3. Baixa no Estoque
    console.log('[LOG] Dando baixa no estoque...');
    for (const item of produtos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: -item.quantidade } }, { new: true, session });
    }
    console.log('[LOG] Baixa no estoque concluída.');

    // 4. LÓGICA PARA GERAR ORDEM DE SERVIÇO
    console.log('[LOG] Verificando se a venda deve gerar uma Ordem de Serviço...');
    // --- CORREÇÃO APLICADA AQUI ---
    // A verificação agora inclui "Serviço/Conserto" exatamente como está no Model.
    const produtosParaOS = await Produto.find({
      _id: { $in: produtos.map((p: any) => p.produto) },
      tipo: { $in: ['Óculos de Grau', 'Serviço/Conserto'] }
    }).session(session).lean();

    if (produtosParaOS.length > 0) {
      console.log(`[LOG] Venda qualificada para O.S. com ${produtosParaOS.length} produto(s).`);

      const clienteInfo = await Cliente.findById(clienteId).session(session).lean();
      if (!clienteInfo) {
        throw new Error('Cliente não encontrado para gerar a Ordem de Serviço.');
      }
      console.log(`[LOG] Informações do cliente ${clienteInfo.fullName} encontradas.`);

      const numeroOS = await getNextNumeroOS(session);

      const novaOS = new OrdemServico({
        numeroOS,
        cliente: clienteId,
        venda: novaVenda._id,
        status: 'Aguardando Laboratório',
        receita: {
          esfericoDireito: clienteInfo.esfericoDireito,
          cilindricoDireito: clienteInfo.cilindricoDireito,
          eixoDireito: clienteInfo.eixoDireito,
          esfericoEsquerdo: clienteInfo.esfericoEsquerdo,
          cilindricoEsquerdo: clienteInfo.cilindricoEsquerdo,
          eixoEsquerdo: clienteInfo.eixoEsquerdo,
          adicao: clienteInfo.adicao,
        },
        produtosServico: produtosParaOS.map(p => ({
          produto: p._id,
          nome: p.nome
        })),
      });

      await novaOS.save({ session });
      console.log(`[LOG] Ordem de Serviço #${numeroOS} criada e salva com sucesso.`);
    } else {
      console.log('[LOG] Venda não necessita de Ordem de Serviço.');
    }

    // 5. Finaliza a transação
    await session.commitTransaction();
    console.log('[LOG] Transação concluída com sucesso (commit).');
    res.status(201).json(novaVenda);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("[ERRO] A transação foi revertida (rollback). Causa:", error.message);
    if (error.message.includes('Estoque insuficiente')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro interno ao criar venda', error: error.message });
  } finally {
    session.endSession();
  }
};

// ... O restante do arquivo continua igual ...

export const getAllVendas = async (req: Request, res: Response) => {
  try {
    const vendas = await Venda.find()
      .populate('cliente', 'fullName')
      .populate({ path: 'produtos.produto', model: 'Produto', select: 'nome' })
      .sort({ dataVenda: -1 });
    res.status(200).json(vendas);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
};

export const getVendaById = async (req: Request, res: Response) => {
  try {
    const venda = await Venda.findById(req.params.id)
      .populate('cliente', 'fullName phone email')
      .populate({
        path: 'produtos.produto',
        model: 'Produto',
        select: 'nome codigo',
      });

    if (!venda) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.status(200).json(venda);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar detalhes da venda', error: error.message });
  }
};

export const updateVendaStatus = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Concluído', 'Cancelado'].includes(status)) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Status inválido.' });
        }

        const venda = await Venda.findById(id).session(session);
        if (!venda) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Venda não encontrada.' });
        }

        const updateData: { [key: string]: any } = { status };

        if (status === 'Concluído') {
            updateData['pagamento.valorEntrada'] = venda.valorTotal;
            updateData['pagamento.valorRestante'] = 0;
        }

        const vendaAtualizada = await Venda.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, session }
        );

        await session.commitTransaction();
        res.status(200).json(vendaAtualizada);

    } catch (error: any) {
        await session.abortTransaction();
        console.error("Falha crítica ao atualizar status da venda:", {
            errorMessage: error.message,
            vendaId: req.params.id,
            statusEnviado: req.body.status,
            stack: error.stack,
        });
        res.status(500).json({ message: 'Erro ao atualizar status da venda', error: error.message });
    } finally {
        session.endSession();
    }
};

export const updateVenda = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { produtos: novosProdutos, ...outrosDados } = req.body;

    const vendaAntiga = await Venda.findById(id).session(session);
    if (!vendaAntiga) {
      throw new Error('Venda original não encontrada.');
    }

    for (const item of vendaAntiga.produtos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: +item.quantidade } }, { session });
    }

    for (const item of novosProdutos) {
      const produtoDB = await Produto.findById(item.produto).session(session);
      if (!produtoDB) throw new Error(`Produto ${item.produto} não encontrado.`);
      if (produtoDB.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para ${produtoDB.nome}. Disponível: ${produtoDB.estoque}`);
      }
    }

    for (const item of novosProdutos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: -item.quantidade } }, { session });
    }

    const valorTotal = novosProdutos.reduce((acc: number, item: any) => acc + (item.quantidade * item.valorUnitario), 0);
    const dadosAtualizados = {
        ...outrosDados,
        produtos: novosProdutos,
        valorTotal,
    };

    const vendaAtualizada = await Venda.findByIdAndUpdate(id, dadosAtualizados, { new: true, session });

    await session.commitTransaction();
    res.status(200).json(vendaAtualizada);

  } catch (error: any) {
    await session.abortTransaction();
    console.error("Erro ao atualizar venda:", error.message);
    if (error.message.includes('Estoque insuficiente')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao atualizar venda', error: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteVenda = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const venda = await Venda.findById(req.params.id).session(session);
    if (!venda) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    for (const item of venda.produtos) {
      await Produto.findByIdAndUpdate(item.produto, { $inc: { estoque: +item.quantidade } }, { session });
    }
    
    await OrdemServico.findOneAndDelete({ venda: venda._id }).session(session);

    await venda.deleteOne({ session });
    await session.commitTransaction();
    res.status(200).json({ message: 'Venda deletada com sucesso e estoque restaurado.' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Erro ao deletar venda', error: error.message });
  } finally {
    session.endSession();
  }
};