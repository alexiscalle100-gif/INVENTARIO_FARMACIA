import { Router } from 'express';
import {
  getCatalogos,
  getConsultorios,
  getConsultorioMedicos,
  getMedicos,
  getPacientes,
  getReservaById,
  getReservas,
  createReserva,
  updateReservaEstado,
  assignMedicoToConsultorio,
  removeMedicoFromConsultorio,
  createMedico,
  createPaciente,
} from '../controllers/reservas.controller';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/catalogos', authenticateToken, getCatalogos);
router.get('/consultorios', authenticateToken, getConsultorios);
router.get('/consultorio-medicos', authenticateToken, getConsultorioMedicos);
router.get('/medicos', authenticateToken, getMedicos);
router.get('/pacientes', authenticateToken, getPacientes);
router.get('/', authenticateToken, getReservas);
router.get('/:id', authenticateToken, getReservaById);
router.post('/medicos', authenticateToken, requireRoles(['admin']), createMedico);
router.post('/pacientes', authenticateToken, requireRoles(['admin', 'farmaceutico', 'cajero']), createPaciente);
router.post('/consultorio-medicos', authenticateToken, requireRoles(['admin']), assignMedicoToConsultorio);
router.post('/', authenticateToken, requireRoles(['admin', 'farmaceutico', 'cajero']), createReserva);
router.patch('/consultorio-medicos/:id', authenticateToken, requireRoles(['admin']), removeMedicoFromConsultorio);
router.patch('/:id/estado', authenticateToken, requireRoles(['admin', 'farmaceutico']), updateReservaEstado);

export default router;
