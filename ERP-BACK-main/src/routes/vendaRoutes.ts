// Caminho: ERP-BACK-main/src/routes/vendaRoutes.ts

import express from 'express';
import { 
  createVenda, 
  getAllVendas, 
  updateVendaStatus,
  getVendaById,
  updateVenda,
  deleteVenda 
} from '../controllers/vendaController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { vendaValidator } from '../lib/validators/vendaValidator';

const router = express.Router();

router.use(authMiddleware);

// Validação aplicada no POST e PUT
router.post('/', validate(vendaValidator), createVenda);
router.get('/', getAllVendas);
router.patch('/:id/status', authMiddleware, updateVendaStatus);
router.get('/:id', getVendaById);
router.put('/:id', validate(vendaValidator), updateVenda);
router.delete('/:id', deleteVenda);

export default router;