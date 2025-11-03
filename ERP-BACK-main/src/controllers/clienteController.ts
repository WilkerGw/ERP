// Caminho: ERP-BACK-main/src/controllers/clienteController.ts

import { Request, Response } from 'express';
import Cliente from '../models/Cliente';

// Interface para estender o Request do Express e incluir o userId
interface AuthRequest extends Request {
  userId?: string;
}

// Criar novo cliente
export const createCliente = async (req: AuthRequest, res: Response) => {
  try {
    const clienteData = { ...req.body, user: req.userId };
    const cliente = new Cliente(clienteData);
    
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error: any) {
    // Mensagem de erro mais detalhada para o frontend.
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Erro: Já existe um cliente com este CPF.' });
    }
    res.status(400).json({ message: 'Erro ao criar cliente', error: error.message });
  }
};

// Obter todos os clientes com lógica de busca por nome ou CPF.
export const getClientes = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchString = search as string;
      
      // Cria uma regex para busca case-insensitive
      const searchRegex = new RegExp(searchString, 'i');
      
      // --- ALTERAÇÃO AQUI ---
      // Agora a busca é feita por nome OU por CPF.
      query = {
        $or: [
          { fullName: searchRegex },
          { cpf: searchRegex }
        ],
      };
    }

    const clientes = await Cliente.find(query).sort({ fullName: 1 });
    res.status(200).json(clientes);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
  }
};

// Obter um cliente por ID
export const getClienteById = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

// Atualizar um cliente
export const updateCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error: any) {
    res.status(400).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
  }
};