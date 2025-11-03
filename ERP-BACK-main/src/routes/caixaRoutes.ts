// Caminho: ERP-BACK-main/src/routes/caixaRoutes.ts

import { Router } from 'express';
import { getCaixa, createTransacao } from '../controllers/caixaController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { TransacaoCaixaSchema } from '../lib/validators/caixaValidator';

const router = Router();

router.use(authMiddleware);
router.get('/', getCaixa);

// Validação aplicada na criação da transação
router.post('/', validate(TransacaoCaixaSchema), createTransacao);

export default router;