import { Router } from 'express';
import authRoutes from './auth.routes';
import productosRoutes from './productos.routes';
import lotesRoutes from './lotes.routes';
import ventasRoutes from './ventas.routes';
import comprasRoutes from './compras.routes';
import cajasRoutes from './cajas.routes';
import recetasRoutes from './recetas.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/lotes', lotesRoutes);
router.use('/ventas', ventasRoutes);
router.use('/compras', comprasRoutes);
router.use('/cajas', cajasRoutes);
router.use('/recetas', recetasRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
