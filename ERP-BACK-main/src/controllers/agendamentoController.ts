import { Request, Response } from 'express';
import Agendamento from '../models/Agendamento';

const getStatusFromBooleans = (agendamento: any): string => {
  if (agendamento.compareceu) return 'Compareceu';
  if (agendamento.faltou) return 'Faltou';
  return 'Aberto';
};

const getBooleansFromStatus = (status: string) => {
  const booleans: { compareceu: boolean, faltou: boolean, [key: string]: any } = {
    compareceu: false,
    faltou: false,
  };
  if (status === 'Compareceu') booleans.compareceu = true;
  if (status === 'Faltou') booleans.faltou = true;
  return booleans;
};

export const createAgendamento = async (req: Request, res: Response) => {
  try {
    const { status, ...dados } = req.body;
    const statusBooleans = getBooleansFromStatus(status);
    const agendamento = new Agendamento({ ...dados, ...statusBooleans });
    await agendamento.save();
    res.status(201).json(agendamento);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
  }
};

export const getAgendamentos = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { name: new RegExp(search as string, 'i') };
    }
    const agendamentos = await Agendamento.find(query).sort({ data: 1, hour: 1 });

    const agendamentosComStatus = agendamentos.map(ag => {
      const agObj = ag.toObject();
      return { ...agObj, status: getStatusFromBooleans(agObj) };
    });
    
    res.status(200).json(agendamentosComStatus);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
};

export const updateAgendamento = async (req: Request, res: Response) => {
  try {
    const { status, ...dados } = req.body;
    const statusBooleans = getBooleansFromStatus(status);
    const agendamento = await Agendamento.findByIdAndUpdate(req.params.id, { ...dados, ...statusBooleans }, { new: true });
    if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });
    res.status(200).json(agendamento);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
  }
};

export const deleteAgendamento = async (req: Request, res: Response) => {
  try {
    const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
    if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });
    res.status(200).json({ message: 'Agendamento deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao deletar agendamento', error: error.message });
  }
};