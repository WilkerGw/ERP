// Caminho: ERP-BACK-main/src/models/Caixa.ts

import { Schema, model, Document } from 'mongoose';

// Define a estrutura de uma transação do caixa
export interface ICaixa extends Document {
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: Date;
}

const CaixaSchema = new Schema<ICaixa>({
  tipo: { 
    type: String, 
    enum: ['entrada', 'saida'], 
    required: true 
  },
  valor: { 
    type: Number, 
    required: true 
  },
  descricao: { 
    type: String, 
    required: true 
  },
  data: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

export default model<ICaixa>('Caixa', CaixaSchema);