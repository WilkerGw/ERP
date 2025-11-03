// Caminho: ERP-BACK-main/src/lib/validators/vendaValidator.ts

import { z } from 'zod';

// Validador para cada produto na venda
export const produtoVendaValidator = z.object({
  produto: z.string(), // No backend, recebemos o ID como string
  quantidade: z.number().min(1, "A quantidade deve ser pelo menos 1."),
  valorUnitario: z.number().min(0, "O valor unitário não pode ser negativo."),
});

// Validador para o objeto de pagamento
export const pagamentoValidator = z.object({
    valorEntrada: z.coerce.number().min(0, "O valor de entrada não pode ser negativo."),
    valorRestante: z.coerce.number().min(0, "O valor restante não pode ser negativo."),
    condicaoPagamento: z.enum(['À vista', 'A prazo']),
    metodoPagamento: z.enum(['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto']),
    parcelas: z.number().min(1).optional(),
});

// Validador principal do formulário de venda
export const vendaValidator = z.object({
  cliente: z.string().nonempty("O cliente é obrigatório."),
  produtos: z.array(produtoVendaValidator).min(1, "Adicione pelo menos um produto à venda."),
  pagamento: pagamentoValidator,
});

export type TVendaValidator = z.infer<typeof vendaValidator>;