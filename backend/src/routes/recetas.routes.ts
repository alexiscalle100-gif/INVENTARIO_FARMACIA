import { Router } from 'express';
import { getRecetas } from '../controllers/recetas.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getRecetas);

export default router;
