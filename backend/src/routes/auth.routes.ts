import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getProfile);

export default router;
