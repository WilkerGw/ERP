// Caminho: ERP-BACK-main/src/routes/clienteRoutes.ts

import { Router } from 'express';
import { createCliente, getClientes, getClienteById, updateCliente, deleteCliente } from '../controllers/clienteController';
import { authMiddleware } from '../middleware/authMiddleware';
// --- NOVAS IMPORTAÇÕES PARA VALIDAÇÃO ---
import { validate } from '../middleware/validationMiddleware';
import { ClienteSchema } from '../lib/validators/clienteValidator'; // Precisamos criar este arquivo

const router = Router();

router.use(authMiddleware);

// Aplicamos o middleware de validação na rota de criação
router.post('/', validate(ClienteSchema), createCliente);

router.get('/', getClientes);
router.get('/:id', getClienteById);

// Aplicamos também na rota de atualização
router.put('/:id', validate(ClienteSchema), updateCliente);

router.delete('/:id', deleteCliente);

export default router;