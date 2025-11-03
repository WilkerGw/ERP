// Caminho: ERP-BACK-main/src/routes/produtoRoutes.ts

import { Router } from 'express';
import { createProduto, getProdutos, getProdutoById, updateProduto, deleteProduto } from '../controllers/produtoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { ProdutoSchema } from '../lib/validators/produtoValidator';

const router = Router();
router.use(authMiddleware);

// Validação aplicada no POST e PUT
router.post('/', validate(ProdutoSchema), createProduto);
router.get('/', getProdutos);
router.get('/:id', getProdutoById);
router.put('/:id', validate(ProdutoSchema), updateProduto);
router.delete('/:id', deleteProduto);

export default router;