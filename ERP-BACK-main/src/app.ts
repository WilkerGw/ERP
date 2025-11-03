// Caminho: ERP-BACK-main/src/app.ts

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// ... importações das rotas ...
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import clienteRoutes from './routes/clienteRoutes';
import produtoRoutes from './routes/produtoRoutes';
import vendaRoutes from './routes/vendaRoutes';
import boletoRoutes from './routes/boletoRoutes';
import agendamentoRoutes from './routes/agendamentoRoutes';
import insightRoutes from './routes/insightRoutes';
import relatorioRoutes from './routes/relatorioRoutes';
import caixaRoutes from './routes/caixaRoutes';
import ordemServicoRoutes from './routes/ordemServicoRoutes';

dotenv.config();
const app = express();


// --- SOLUÇÃO: MIDDLEWARE PARA TORNAR REQ.QUERY EDITÁVEL ---
// Este middleware resolve a incompatibilidade com o express-mongo-sanitize no Express 5.
// Ele deve ser uma das primeiras coisas que o app usa.
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: req.query,
    writable: true,
  });
  next();
});
// --- FIM DA SOLUÇÃO ---


const corsOptions = {
  origin: ['http://localhost:3000', 'https://erp-front-ebon.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições enviadas deste IP, por favor, tente novamente após 15 minutos.',
});
app.use('/api', limiter);

app.use(cors(corsOptions));
app.use(express.json());
app.use(mongoSanitize());

// Rotas da Aplicação
//roat
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/boletos', boletoRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/caixa', caixaRoutes);
app.use('/api/ordens-servico', ordemServicoRoutes);

app.get('/api/health', (req, res) => {
  res.send('Backend está funcionando!');
});

export default app;