// Caminho: ERP-BACK-main/src/routes/agendamentoRoutes.ts

import { Router } from 'express';
import { createAgendamento, getAgendamentos, updateAgendamento, deleteAgendamento } from '../controllers/agendamentoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { AgendamentoSchema } from '../lib/validators/agendamentoValidator';

const router = Router();
router.use(authMiddleware);

// Validação aplicada no POST e PUT
router.post('/', validate(AgendamentoSchema), createAgendamento);
router.get('/', getAgendamentos);
router.put('/:id', validate(AgendamentoSchema), updateAgendamento);
router.delete('/:id', deleteAgendamento);

export default router;