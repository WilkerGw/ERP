// Caminho: ERP-BACK-main/src/routes/ordemServicoRoutes.ts

import { Router } from 'express';
import {
  getOrdensServico,
  getOrdemServicoById,
  updateOrdemServicoStatus
} from '../controllers/ordemServicoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas aqui necessitam de autenticação
router.use(authMiddleware);

// Rota para listar todas as O.S. (com filtros)
// GET /api/ordens-servico?status=Em%20Produção&search=Fulano
router.get('/', getOrdensServico);

// Rota para buscar uma O.S. específica pelo seu ID
// GET /api/ordens-servico/60d21b4667d0d8992e610c85
router.get('/:id', getOrdemServicoById);

// Rota para atualizar o status de uma O.S.
// PATCH /api/ordens-servico/60d21b4667d0d8992e610c85/status
router.patch('/:id/status', updateOrdemServicoStatus);

export default router;