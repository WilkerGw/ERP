import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  nome: string;
  email: string;
  senha: string;
}

const UserSchema = new Schema<IUser>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha: { type: String, required: true, select: false },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('senha')) {
    return next();
  }
  const hash = await bcrypt.hash(this.senha, 12);
  this.senha = hash;
  next();
});

export default model<IUser>('User', UserSchema);