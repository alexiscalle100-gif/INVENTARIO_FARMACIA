import { Router } from 'express';
import { abrirCaja, getSesionActiva, cerrarCaja } from '../controllers/cajas.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/activa', authenticateToken, getSesionActiva);
router.post('/abrir', authenticateToken, abrirCaja);
router.post('/cerrar', authenticateToken, cerrarCaja);

export default router;
