// Caminho: ERP-BACK-main/src/lib/validators/caixaValidator.ts

import { z } from 'zod';

export const TransacaoCaixaSchema = z.object({
  tipo: z.enum(['entrada', 'saida']),
  valor: z.coerce.number().min(0.01, { message: 'O valor deve ser maior que zero.' }),
  descricao: z.string().min(3, { message: 'A descrição deve ter no mínimo 3 caracteres.' }),
});