import { Schema, model, Document } from 'mongoose';

interface IBoleto extends Document {
  client: Schema.Types.ObjectId; // Alterado de 'cliente'
  venda?: Schema.Types.ObjectId;
  parcelValue: number; // Alterado de 'valor'
  dueDate: Date; // Alterado de 'dataVencimento'
  description: string; // Alterado de 'parcela'
  status: string; // Trocado para String para aceitar 'aberto'
  valorTotalVenda?: number; // Tornamos opcional para dados antigos
}

const BoletoSchema = new Schema<IBoleto>({
  client: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  venda: { type: Schema.Types.ObjectId, ref: 'Venda' },
  parcelValue: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'aberto' },
  valorTotalVenda: { type: Number },
}, { timestamps: true });

// Forçamos o uso da coleção 'boletos' (ou o nome da sua coleção existente)
export default model<IBoleto>('Boleto', BoletoSchema, 'boletos');