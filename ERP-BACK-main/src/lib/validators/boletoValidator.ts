// Caminho: ERP-BACK-main/src/lib/validators/boletoValidator.ts

import { z } from 'zod';

export const ParcelamentoSchema = z.object({
    clienteId: z.string().nonempty("O ID do cliente é obrigatório."),
    valorTotal: z.number().min(0.01, "O valor total deve ser positivo."),
    valorEntrada: z.number().min(0).optional(),
    numParcelas: z.number().int().min(1, "O número de parcelas deve ser no mínimo 1."),
    dataPrimeiroVencimento: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Data inválida." }),
});