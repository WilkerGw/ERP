// Caminho: ERP-FRONT-main/src/lib/validators/vendaValidator.ts

import { z } from 'zod';

// Validador para cada produto na venda
export const produtoVendaValidator = z.object({
  produtoId: z.string().nonempty("O produto é obrigatório."),
  nome: z.string(), // Apenas para exibição no formulário
  quantidade: z.number().min(1, "A quantidade deve ser pelo menos 1."),
  valorUnitario: z.number().min(0, "O valor unitário não pode ser negativo."),
});

// Validador principal do formulário de venda
export const vendaFormValidator = z.object({
  clienteId: z.string().nonempty("O cliente é obrigatório."),
  produtos: z.array(produtoVendaValidator).min(1, "Adicione pelo menos um produto à venda."),
  
  // --- ALTERAÇÃO AQUI ---
  // Removemos 'porcentagemEntrada' e adicionamos 'valorEntrada'
  valorEntrada: z.coerce.number().min(0, "O valor de entrada não pode ser negativo."),
  
  condicaoPagamento: z.enum(['À vista', 'A prazo']),
  metodoPagamento: z.enum(['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto']),
  parcelas: z.number().min(1, "O número de parcelas deve ser pelo menos 1.").optional(),
});

// Tipagem inferida a partir do schema para uso no formulário
export type TProdutoVendaValidator = z.infer<typeof produtoVendaValidator>;
export type TVendaFormValidator = z.infer<typeof vendaFormValidator>;