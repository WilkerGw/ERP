import mongoose, { Schema, model, Document } from 'mongoose';

type TipoProduto = 'Óculos de Sol' | 'Óculos de Grau' | 'Lente de Contato' | 'Serviço/Conserto';

export interface IProduto extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  codigo: string;
  nome: string;
  precoCusto: number;
  precoVenda: number;
  estoque: number;
  tipo: TipoProduto;
}

const ProdutoSchema = new Schema<IProduto>({
  codigo: { type: String, required: true, unique: true, trim: true },
  nome: { type: String, required: true },
  precoCusto: { type: Number, required: true },
  precoVenda: { type: Number, required: true },
  estoque: { type: Number, required: true, default: 0 },
  tipo: {
    type: String,
    enum: ['Óculos de Sol', 'Óculos de Grau', 'Lente de Contato', 'Serviço/Conserto'],
    required: true,
  },
}, { timestamps: true });

export default model<IProduto>('Produto', ProdutoSchema);