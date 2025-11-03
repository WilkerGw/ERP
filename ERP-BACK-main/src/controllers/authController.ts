// src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Função para gerar o token JWT
function generateToken(params = {}) {
  // O token expira em 1 dia (86400 segundos)
  return jwt.sign(params, process.env.JWT_SECRET as string, {
    expiresIn: 86400,
  });
}

export const register = async (req: Request, res: Response) => {
  const { email, nome, senha } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Usuário já cadastrado.' });
    }

    const user = await User.create({ email, nome, senha });

    // Impede que a senha seja retornada na resposta
    user.senha = undefined as any;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: 'Falha no registro' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  try {
    // Busca o usuário e inclui a senha na busca
    const user = await User.findOne({ email }).select('+senha');

    if (!user) {
      return res.status(400).send({ error: 'Usuário não encontrado.' });
    }

    // Compara a senha enviada com a senha criptografada no banco
    if (!await bcrypt.compare(senha, user.senha)) {
      return res.status(400).send({ error: 'Senha inválida.' });
    }

    user.senha = undefined as any;

    res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: 'Falha no login' });
  }
};