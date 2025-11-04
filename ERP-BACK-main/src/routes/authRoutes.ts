// Caminho: ERP-BACK-main/src/routes/authRoutes.ts

import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middleware/validationMiddleware';
import { RegisterSchema, LoginSchema } from '../lib/validators/authValidator';
// --- NOVA IMPORTAÇÃO ---
import rateLimit from 'express-rate-limit';

const router = Router();

// --- NOVO: Rate limiter específico para a rota de login ---
// --- CORREÇÃO SUGERIDA AQUI ---
// Aumentamos o limite para 15 tentativas e diminuímos a janela para 15 minutos.
// Em produção, você pode voltar para regras mais rígidas, mas 3 tentativas é muito pouco.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Limita cada IP a 15 requisições de login por janela de 15 minutos
  message: 'Muitas tentativas de login a partir deste IP. Por favor, tente novamente após 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rota para registrar um novo usuário (continua com a proteção geral de 100 req/15 min)
router.post('/register', validate(RegisterSchema), register);

// Rota para fazer login com o novo limitador mais restrito aplicado
router.post('/login', loginLimiter, validate(LoginSchema), login);

export default router;