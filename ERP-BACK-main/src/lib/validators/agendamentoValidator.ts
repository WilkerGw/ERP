// Caminho: ERP-BACK-main/src/lib/validators/agendamentoValidator.ts

import { z } from 'zod';

export const AgendamentoSchema = z.object({
  name: z.string().min(3, { message: 'O nome é obrigatório.' }),
  telephone: z.string().min(10, { message: 'Telefone inválido.' }),
  date: z.string().refine((d) => d && !isNaN(Date.parse(d)), { message: "Data é obrigatória." }),
  hour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Hora inválida (formato HH:MM)." }),
  observation: z.string().optional(),
  status: z.enum(['Aberto', 'Compareceu', 'Faltou', 'Cancelado']).default('Aberto'),
});

export type TAgendamentoSchema = z.infer<typeof AgendamentoSchema>;