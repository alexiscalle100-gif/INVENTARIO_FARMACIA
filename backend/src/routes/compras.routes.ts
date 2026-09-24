import { Router } from 'express';
import { registrarCompra, getProveedores } from '../controllers/compras.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/proveedores', authenticateToken, getProveedores);
router.post('/', authenticateToken, requireRoles(['admin', 'farmaceutico']), registrarCompra);

export default router;
