// Caminho: src/types/models.d.ts

export interface IClientePopulado {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface IProdutoPopulado {
  _id: string;
  nome: string;
  codigo?: string;
}

export interface IProdutoVendaPopulado {
  produto: IProdutoPopulado;
  quantidade: number;
  valorUnitario: number;
  _id: string;
}

export interface IPagamento {
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'PIX' | 'Boleto';
  condicaoPagamento: 'À vista' | 'A prazo';
  parcelas?: number;
}

export interface IVendaPopulada {
  _id: string;
  cliente: IClientePopulado;
  produtos: IProdutoVendaPopulado[];
  valorTotal: number;
  pagamento: IPagamento;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  dataVenda: string;
}

// --- INTERFACE DA O.S. ATUALIZADA ---
export type StatusOrdemServico = 
  | 'Aguardando Laboratório'
  | 'Em Produção'
  | 'Em Montagem'
  | 'Disponível para Retirada'
  | 'Entregue'
  | 'Cancelada';

export interface IOrdemServicoPopulada {
    _id: string;
    numeroOS: number;
    cliente: IClientePopulado;
    venda: IVendaPopulada; // Agora populamos a venda inteira
    status: StatusOrdemServico;
    previsaoEntrega?: string;
    dataEntrega?: string;
    createdAt: string;
    observacoes?: string;
    laboratorio?: string;
    receita: {
        esfericoDireito?: string;
        cilindricoDireito?: string;
        eixoDireito?: string;
        esfericoEsquerdo?: string;
        cilindricoEsquerdo?: string;
        eixoEsquerdo?: string;
        adicao?: string;
        altura?: string;
        dp?: string;
    };
    produtosServico: {
        produto: string; // ID do produto
        nome: string;
    }[];
}