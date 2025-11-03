// Caminho: ERP-BACK-main/src/models/OrdemServico.ts

import mongoose, { Document, Schema, model } from 'mongoose';

// Define os possíveis status que uma Ordem de Serviço pode ter.
// Usar um 'type' aqui ajuda a garantir consistência no código.
export type StatusOrdemServico =
  | 'Aguardando Laboratório'
  | 'Em Produção'
  | 'Em Montagem'
  | 'Disponível para Retirada'
  | 'Entregue'
  | 'Cancelada';

// Interface que define a estrutura de uma Ordem de Serviço no TypeScript
export interface IOrdemServico extends Document {
  numeroOS: number;
  cliente: mongoose.Schema.Types.ObjectId;
  venda: mongoose.Schema.Types.ObjectId;
  status: StatusOrdemServico;
  previsaoEntrega?: Date;
  dataEntrega?: Date;
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
    produto: mongoose.Schema.Types.ObjectId;
    nome: string; // Guardamos o nome para facilitar a exibição
  }[];
}

// Schema do Mongoose, que define como os dados são salvos no MongoDB
const OrdemServicoSchema = new Schema<IOrdemServico>({
  numeroOS: { type: Number, required: true, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  venda: { type: mongoose.Schema.Types.ObjectId, ref: 'Venda', required: true },
  status: {
    type: String,
    enum: [
      'Aguardando Laboratório',
      'Em Produção',
      'Em Montagem',
      'Disponível para Retirada',
      'Entregue',
      'Cancelada'
    ],
    default: 'Aguardando Laboratório',
  },
  previsaoEntrega: { type: Date },
  dataEntrega: { type: Date },
  observacoes: { type: String },
  laboratorio: { type: String },
  receita: {
    esfericoDireito: { type: String },
    cilindricoDireito: { type: String },
    eixoDireito: { type: String },
    esfericoEsquerdo: { type: String },
    cilindricoEsquerdo: { type: String },
    eixoEsquerdo: { type: String },
    adicao: { type: String },
    altura: { type: String },
    dp: { type: String },
  },
  produtosServico: [{
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' },
    nome: { type: String }
  }],
}, { timestamps: true }); // timestamps adiciona createdAt e updatedAt automaticamente

export default model<IOrdemServico>('OrdemServico', OrdemServicoSchema);