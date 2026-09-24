import { Router } from 'express';
import { getDashboardMetrics, getGraficosStats } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/metrics', authenticateToken, getDashboardMetrics);
router.get('/graficos', authenticateToken, getGraficosStats);

export default router;
