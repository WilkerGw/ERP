import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Esta rota GET para '/' (que será /api/dashboard/) está protegida pelo authMiddleware.
// Só passará para o getDashboardStats se o token for válido.
router.get('/', authMiddleware, getDashboardStats);

export default router;