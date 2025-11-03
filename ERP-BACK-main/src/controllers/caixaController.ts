// Caminho: ERP-BACK-main/src/controllers/caixaController.ts

import { Request, Response } from 'express';
import Caixa from '../models/Caixa';

// Função para obter todas as transações e o saldo atual
export const getCaixa = async (req: Request, res: Response) => {
  try {
    const transacoes = await Caixa.find().sort({ data: -1 });

    const saldo = transacoes.reduce((acc, transacao) => {
      if (transacao.tipo === 'entrada') {
        return acc + transacao.valor;
      }
      return acc - transacao.valor;
    }, 0);

    res.status(200).json({
      transacoes,
      saldo,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar transações do caixa', error: error.message });
  }
};

// Função para adicionar uma nova transação (entrada ou saída)
export const createTransacao = async (req: Request, res: Response) => {
  try {
    const { tipo, valor, descricao } = req.body;

    if (!tipo || !valor || !descricao) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios: tipo, valor, descricao.' });
    }

    if (valor <= 0) {
        return res.status(400).json({ message: 'O valor da transação deve ser positivo.' });
    }

    const novaTransacao = new Caixa({ tipo, valor, descricao });
    await novaTransacao.save();
    
    res.status(201).json(novaTransacao);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao criar transação', error: error.message });
  }
};