import { Router } from 'express';
// --- IMPORTAÇÃO ADICIONADA ---
import { 
  getFaturamentoMensal, 
  getVendasPorMetodo, 
  getTopClientes, 
  getEficienciaAgendamentos, 
  getFluxoCaixaFuturo,
  getComparativoVendasAnual // <-- NOVA IMPORTAÇÃO
} from '../controllers/relatorioController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/faturamento-mensal', getFaturamentoMensal);
router.get('/vendas-por-metodo', getVendasPorMetodo);
router.get('/top-clientes', getTopClientes);
router.get('/eficiencia-agendamentos', getEficienciaAgendamentos);
router.get('/fluxo-caixa-futuro', getFluxoCaixaFuturo);

// --- NOVA ROTA ADICIONADA ---
router.get('/comparativo-vendas-anual', getComparativoVendasAnual);

export default router;