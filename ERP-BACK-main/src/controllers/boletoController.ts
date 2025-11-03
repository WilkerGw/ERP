import { Request, Response } from 'express';
import Boleto from '../models/Boleto';
import mongoose from 'mongoose';
import { calcularParcelas } from '../utils/boletoUtils';

export const createParcelamento = async (req: Request, res: Response) => {
  const { clienteId, valorTotal, valorEntrada, numParcelas, dataPrimeiroVencimento } = req.body;
  if (!clienteId || !valorTotal || !numParcelas || !dataPrimeiroVencimento) {
    return res.status(400).json({ message: 'Dados insuficientes.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parcelasCalculadas = calcularParcelas({
      valorTotal,
      valorEntrada,
      numParcelas,
      dataPrimeiroVencimento,
    });

    const boletosParaSalvar = parcelasCalculadas.map((parcela, index) => {
      return new Boleto({
        client: clienteId,
        parcelValue: parcela.valor,
        dueDate: parcela.dataVencimento,
        description: `Parcela ${index + 1}/${numParcelas}`,
        status: 'aberto',
        valorTotalVenda: valorTotal,
      });
    });

    await Boleto.insertMany(boletosParaSalvar, { session });
    
    await session.commitTransaction();
    res.status(201).json({ message: 'Parcelamento gerado com sucesso!', boletos: boletosParaSalvar });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Erro ao gerar parcelamento', error: error.message });
  } finally {
    session.endSession();
  }
};

export const getBoletosAgrupados = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const matchStage: any = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (status === 'Pagos') matchStage.status = 'pago';
    else if (status === 'Abertos') {
      matchStage.status = 'aberto';
      matchStage.dueDate = { $gte: hoje };
    } else if (status === 'Atrasados') {
      matchStage.status = 'aberto';
      matchStage.dueDate = { $lt: hoje };
    }

    const boletosAgrupados = await Boleto.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'clients', localField: 'client', foreignField: '_id', as: 'clienteInfo' } },
      { $unwind: '$clienteInfo' },
      {
        $group: {
          _id: { ano: { $year: '$dueDate' }, mes: { $month: '$dueDate' } },
          boletos: { $push: '$$ROOT' },
          valorTotalMes: { $sum: '$parcelValue' },
          pagosNoMes: { $sum: { $cond: [{ $eq: ['$status', 'pago'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.ano': -1, '_id.mes': -1 } }
    ]);
    res.status(200).json(boletosAgrupados);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar boletos', error: error.message });
  }
};

export const updateStatusBoleto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status.toLowerCase() !== 'pago') {
      return res.status(400).json({ message: 'Apenas o status "pago" é permitido.' });
    }

    const boleto = await Boleto.findByIdAndUpdate(id, { status: 'pago' }, { new: true });
    if (!boleto) return res.status(404).json({ message: 'Boleto não encontrado' });
    res.status(200).json(boleto);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao atualizar status', error: error.message });
  }
};