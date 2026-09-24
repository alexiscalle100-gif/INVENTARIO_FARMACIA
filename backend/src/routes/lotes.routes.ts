import { Router } from 'express';
import { getLotes, getAlertasVencimiento, getKardex, registrarMerma } from '../controllers/lotes.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getLotes);
router.get('/alertas', authenticateToken, getAlertasVencimiento);
router.get('/kardex', authenticateToken, getKardex);
router.post('/merma', authenticateToken, registrarMerma);

export default router;
