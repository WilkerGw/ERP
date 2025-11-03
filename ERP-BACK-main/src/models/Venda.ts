// Caminho: ERP-BACK-main/src/models/Venda.ts

import mongoose, { Document, Schema } from 'mongoose';

// Interface para o item de produto na venda
export interface IProdutoVenda extends Document {
  produto: mongoose.Schema.Types.ObjectId;
  quantidade: number;
  valorUnitario: number;
}

// Interface para os detalhes de pagamento
export interface IPagamento extends Document {
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'PIX' | 'Boleto';
  condicaoPagamento: 'À vista' | 'A prazo';
  parcelas?: number;
}

// Interface principal da Venda
export interface IVenda extends Document {
  cliente: mongoose.Schema.Types.ObjectId;
  produtos: IProdutoVenda[];
  valorTotal: number;
  pagamento: IPagamento;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  dataVenda: Date;
}

const ProdutoVendaSchema: Schema = new Schema({
  produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: true },
  valorUnitario: { type: Number, required: true },
});

const PagamentoSchema: Schema = new Schema({
  valorEntrada: { type: Number, required: true, default: 0 },
  valorRestante: { type: Number, required: true, default: 0 },
  metodoPagamento: { type: String, enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto'], required: true },
  condicaoPagamento: { type: String, enum: ['À vista', 'A prazo'], required: true },
  parcelas: { type: Number },
});


const VendaSchema: Schema = new Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  produtos: [ProdutoVendaSchema],
  valorTotal: { type: Number, required: true },
  pagamento: PagamentoSchema,
  status: { type: String, enum: ['Pendente', 'Concluído', 'Cancelado'], default: 'Pendente' },
  dataVenda: { type: Date, default: Date.now },
});

export default mongoose.model<IVenda>('Venda', VendaSchema);