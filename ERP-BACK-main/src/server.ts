import app from './app';
import mongoose from 'mongoose';

// --- CORREÇÃO APLICADA AQUI ---
// Usamos parseInt() para garantir que a porta seja um número.
// O '10' é para garantir que a conversão seja feita na base decimal.
const PORT = parseInt(process.env.PORT || '3001', 10);

const mongoUri = process.env.MONGO_URI as string;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB conectado com sucesso!');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando em http://localhost:${PORT} e acessível na rede local`);
    });
  })
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));