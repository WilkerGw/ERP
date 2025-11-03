// Caminho: ERP-BACK-main/src/lib/validators/authValidator.ts

import { z } from 'zod';

export const RegisterSchema = z.object({
  nome: z.string().min(3, { message: 'Nome é obrigatório.'}),
  email: z.string().email({ message: 'Email inválido.' }),
  senha: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  senha: z.string().min(1, { message: 'Senha é obrigatória.' }),
});