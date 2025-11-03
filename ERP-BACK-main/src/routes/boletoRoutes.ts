// Caminho: ERP-BACK-main/src/routes/boletoRoutes.ts

import { Router } from 'express';
import { createParcelamento, getBoletosAgrupados, updateStatusBoleto } from '../controllers/boletoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { ParcelamentoSchema } from '../lib/validators/boletoValidator';

const router = Router();
router.use(authMiddleware);

// Validação aplicada na criação do parcelamento
router.post('/parcelamento', validate(ParcelamentoSchema), createParcelamento);
router.get('/', getBoletosAgrupados);
router.patch('/:id/status', updateStatusBoleto);

export default router;