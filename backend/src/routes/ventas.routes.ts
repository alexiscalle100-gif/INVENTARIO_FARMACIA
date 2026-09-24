import { Router } from 'express';
import { registrarVenta, getVentas } from '../controllers/ventas.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, registrarVenta);
router.get('/', authenticateToken, getVentas);

export default router;
