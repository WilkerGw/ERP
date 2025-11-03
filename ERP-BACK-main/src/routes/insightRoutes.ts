import { Router } from 'express';
import { getLatestInsight } from '../controllers/insightController'; // Importa a função com nome novo
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// Rota atualizada para ser mais genérica
router.get('/latest', getLatestInsight);

export default router;