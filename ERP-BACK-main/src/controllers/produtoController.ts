import { Request, Response } from 'express';
import Produto from '../models/Produto';

// Criar novo produto
export const createProduto = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.body;
    const produtoExistente = await Produto.findOne({ codigo });
    if (produtoExistente) {
      return res.status(400).json({ message: 'Já existe um produto com este código.' });
    }
    const produto = new Produto(req.body);
    await produto.save();
    res.status(201).json(produto);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Obter todos os produtos com busca
export const getProdutos = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query = { $or: [{ nome: searchRegex }, { codigo: searchRegex }] };
    }
    const produtos = await Produto.find(query).sort({ nome: 1 });
    res.status(200).json(produtos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Obter um produto por ID
export const getProdutoById = async (req: Request, res: Response) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(200).json(produto);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar um produto
export const updateProduto = async (req: Request, res: Response) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(200).json(produto);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Deletar um produto
export const deleteProduto = async (req: Request, res: Response) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};