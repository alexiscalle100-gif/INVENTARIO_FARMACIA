import { Router } from 'express';
import {
  getCatalogos,
  getConsultorios,
  getMedicos,
  getPacientes,
  getReservaById,
  getReservas,
  createReserva,
  updateReservaEstado,
  createConsultorio,
  createMedico,
  createPaciente,
} from '../controllers/reservas.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/catalogos', authenticateToken, getCatalogos);
router.get('/consultorios', authenticateToken, getConsultorios);
router.get('/medicos', authenticateToken, getMedicos);
router.get('/pacientes', authenticateToken, getPacientes);
router.get('/', authenticateToken, getReservas);
router.get('/:id', authenticateToken, getReservaById);
router.post('/consultorios', authenticateToken, requireRoles(['admin']), createConsultorio);
router.post('/medicos', authenticateToken, requireRoles(['admin']), createMedico);
router.post('/pacientes', authenticateToken, requireRoles(['admin', 'farmaceutico', 'cajero']), createPaciente);
router.post('/', authenticateToken, requireRoles(['admin', 'farmaceutico', 'cajero']), createReserva);
router.patch('/:id/estado', authenticateToken, requireRoles(['admin', 'farmaceutico']), updateReservaEstado);

export default router;
