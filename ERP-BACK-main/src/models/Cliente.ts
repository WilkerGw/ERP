// Caminho: ERP-BACK-main/src/models/Cliente.ts

import mongoose, { Document, Schema } from 'mongoose';

// Interface exportada com a propriedade _id explícita
export interface ICliente extends Document {
  _id: mongoose.Schema.Types.ObjectId; // <-- CORREÇÃO PRINCIPAL AQUI
  fullName: string;
  cpf: string;
  phone: string;
  birthDate: Date;
  gender?: string;
  address?: string;
  cep?: string;
  notes?: string;
  esfericoDireito?: string;
  cilindricoDireito?: string;
  eixoDireito?: string;
  esfericoEsquerdo?: string;
  cilindricoEsquerdo?: string;
  eixoEsquerdo?: string;
  adicao?: string;
  vencimentoReceita?: Date;
  user: mongoose.Schema.Types.ObjectId;
}

const clienteSchema = new Schema<ICliente>({
  fullName: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  birthDate: { type: Date, required: true },
  gender: { type: String },
  address: { type: String },
  cep: { type: String },
  notes: { type: String },
  esfericoDireito: { type: String },
  cilindricoDireito: { type: String },
  eixoDireito: { type: String },
  esfericoEsquerdo: { type: String },
  cilindricoEsquerdo: { type: String },
  eixoEsquerdo: { type: String },
  adicao: { type: String },
  vencimentoReceita: { type: Date },
  user: { // Adicionando a referência ao usuário que faltava no schema
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  collection: 'clients'
});

export default mongoose.model<ICliente>('Cliente', clienteSchema);