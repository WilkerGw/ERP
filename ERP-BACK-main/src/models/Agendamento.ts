import mongoose, { Schema, model, Document } from 'mongoose';

export interface IAgendamento extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  telephone: string;
  date: Date;
  hour: string;
  observation?: string;
  contactado?: boolean;
  compareceu?: boolean;
  faltou?: boolean;
  naoComprou?: boolean;
}

const AgendamentoSchema = new Schema<IAgendamento>({
  name: { type: String, required: true },
  telephone: { type: String, required: true },
  date: { type: Date, required: true },
  hour: { type: String, required: true },
  observation: { type: String },
  contactado: { type: Boolean, default: false },
  compareceu: { type: Boolean, default: false },
  faltou: { type: Boolean, default: false },
  naoComprou: { type: Boolean, default: false },
}, { timestamps: true });

export default model<IAgendamento>('Agendamento', AgendamentoSchema, 'agendamentos');