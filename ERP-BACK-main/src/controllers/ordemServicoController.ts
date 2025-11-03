// Caminho: ERP-BACK-main/src/controllers/ordemServicoController.ts

import { Request, Response } from 'express';
import OrdemServico, { StatusOrdemServico } from '../models/OrdemServico';
import mongoose from 'mongoose';

// Função para listar todas as Ordens de Serviço com filtros
export const getOrdensServico = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let query: any = {};

    if (status && status !== 'Todos') {
      query.status = status as string;
    }

    let ordens;

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      // Busca por número da OS ou nome do cliente
      const clientes = await mongoose.model('Cliente').find({ fullName: searchRegex }).select('_id');
      const clienteIds = clientes.map(c => c._id);

      query.$or = [
        { cliente: { $in: clienteIds } },
      ];
      // Adiciona busca por número da OS se o search for um número
      if (!isNaN(Number(search))) {
        query.$or.push({ numeroOS: Number(search) });
      }
    }

    ordens = await OrdemServico.find(query)
      .populate('cliente', 'fullName') // Popula o campo 'cliente' trazendo apenas o 'fullName'
      .sort({ createdAt: -1 }); // Ordena pelas mais recentes

    res.status(200).json(ordens);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar Ordens de Serviço', error: error.message });
  }
};

// Função para buscar uma O.S. específica pelo ID
export const getOrdemServicoById = async (req: Request, res: Response) => {
  try {
    const ordem = await OrdemServico.findById(req.params.id)
      .populate('cliente', 'fullName email phone')
      .populate({
        path: 'venda',
        populate: {
          path: 'produtos.produto',
          model: 'Produto'
        }
      });

    if (!ordem) {
      return res.status(404).json({ message: 'Ordem de Serviço não encontrada' });
    }
    res.status(200).json(ordem);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar detalhes da O.S.', error: error.message });
  }
};

// Função para atualizar o status de uma O.S.
export const updateOrdemServicoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: StatusOrdemServico };

    const updateData: { status: StatusOrdemServico, dataEntrega?: Date } = { status };

    // Se o status for "Entregue", define a data de entrega como a data atual
    if (status === 'Entregue') {
      updateData.dataEntrega = new Date();
    }

    const ordem = await OrdemServico.findByIdAndUpdate(id, updateData, { new: true });

    if (!ordem) {
      return res.status(404).json({ message: 'Ordem de Serviço não encontrada.' });
    }
    res.status(200).json(ordem);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao atualizar status da O.S.', error: error.message });
  }
};