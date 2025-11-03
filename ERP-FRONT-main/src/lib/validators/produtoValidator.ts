import { z } from 'zod';

export const ProdutoSchema = z.object({
  codigo: z.string().min(1, { message: 'Código é obrigatório.' }),
  nome: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  
  // Usamos z.coerce.number() que lida com a conversão de string para número
  precoCusto: z.coerce.number().min(0, { message: 'Preço de custo deve ser positivo.' }),
  precoVenda: z.coerce.number().min(0, { message: 'Preço de venda deve ser positivo.' }),
  estoque: z.coerce.number().int({ message: 'Estoque deve ser um número inteiro.' }),

  tipo: z.enum(['Óculos de Sol', 'Óculos de Grau', 'Lente de Contato', 'Serviço/Conserto'], {
    required_error: "Você precisa selecionar um tipo de produto.",
  }),
});

export type TProdutoSchema = z.infer<typeof ProdutoSchema>;