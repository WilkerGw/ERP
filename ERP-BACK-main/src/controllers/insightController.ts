import { Request, Response } from 'express';
import Insight from '../models/Insight';

// Nome da função atualizado para ser mais genérico
export const getLatestInsight = async (req: Request, res: Response) => {
  try {
    // --- MUDANÇA PRINCIPAL AQUI ---
    // Busca pelo novo tipo de relatório que o agente Python está salvando
    const insight = await Insight.findOne({ tipo: 'relatorio_geral_negocio' }).sort({ dataGeracao: -1 });
    res.status(200).json(insight);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar insight', error: error.message });
  }
};