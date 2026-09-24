import { Router } from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  getCategorias,
  getUbicaciones,
  getEquivalentes,
} from '../controllers/productos.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/categorias', authenticateToken, getCategorias);
router.get('/ubicaciones', authenticateToken, getUbicaciones);
router.get('/:id/equivalentes', authenticateToken, getEquivalentes);
router.get('/', authenticateToken, getProductos);
router.get('/:id', authenticateToken, getProductoById);
router.post('/', authenticateToken, requireRoles(['admin', 'farmaceutico']), createProducto);

export default router;
