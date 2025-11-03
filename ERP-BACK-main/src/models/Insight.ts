import { Schema, model, Document } from 'mongoose';

export interface IInsight extends Document {
  titulo: string;
  conteudo: string;
  tipo: string;
  dataGeracao: Date;
}

const InsightSchema = new Schema<IInsight>({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  tipo: { type: String, required: true, unique: true }, // 'resumo_vendas', etc.
  dataGeracao: { type: Date, default: Date.now },
}, { timestamps: true });

export default model<IInsight>('Insight', InsightSchema);