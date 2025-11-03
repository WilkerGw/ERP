// Caminho: ERP-BACK-main/src/lib/validators/clienteValidator.ts

import { z } from 'zod';

export const ClienteSchema = z.object({
  fullName: z.string().min(3, { message: 'O nome é obrigatório.' }),
  cpf: z.string().min(14, { message: 'CPF inválido.' }),
  phone: z.string().min(10, { message: 'Telefone inválido.' }),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  cep: z.string().optional(),
  notes: z.string().optional(),
  esfericoDireito: z.string().optional(),
  cilindricoDireito: z.string().optional(),
  eixoDireito: z.string().optional(),
  esfericoEsquerdo: z.string().optional(),
  cilindricoEsquerdo: z.string().optional(),
  eixoEsquerdo: z.string().optional(),
  adicao: z.string().optional(),
  vencimentoReceita: z.string().optional(),
  user: z.string().optional(), // Adicionado para consistência, Mongoose irá preenchê-lo
});

export type TClienteSchema = z.infer<typeof ClienteSchema>;