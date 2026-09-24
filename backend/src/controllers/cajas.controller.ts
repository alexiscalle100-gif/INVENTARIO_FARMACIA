import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const abrirCaja = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const { monto_inicial_fondo } = req.body;

    // Verificar si el empleado ya tiene una sesión abierta
    const activa = await query(
      `SELECT * FROM sesiones_caja WHERE id_empleado = $1 AND estado = 'abierta'`,
      [req.user.id_empleado]
    );

    if (activa.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya tienes una sesión de caja abierta',
        data: activa.rows[0],
      });
      return;
    }

    const result = await query(
      `INSERT INTO sesiones_caja (id_empleado, monto_inicial_fondo, estado)
       VALUES ($1, $2, 'abierta')
       RETURNING *`,
      [req.user.id_empleado, monto_inicial_fondo || 0.00]
    );

    res.status(201).json({ success: true, message: 'Caja abierta exitosamente', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSesionActiva = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const result = await query(
      `SELECT s.*, e.nombre_completo AS empleado_nombre
       FROM sesiones_caja s
       JOIN empleados e ON s.id_empleado = e.id_empleado
       WHERE s.id_empleado = $1 AND s.estado = 'abierta'
       ORDER BY s.fecha_apertura DESC LIMIT 1`,
      [req.user.id_empleado]
    );

    if (result.rows.length === 0) {
      res.json({ success: true, data: null, message: 'No hay sesión de caja abierta' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cerrarCaja = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_sesion_caja, monto_cierre_real } = req.body;

    const sesionRes = await query(
      'SELECT * FROM sesiones_caja WHERE id_sesion_caja = $1',
      [id_sesion_caja]
    );

    if (sesionRes.rows.length === 0 || sesionRes.rows[0].estado !== 'abierta') {
      res.status(400).json({ success: false, message: 'La sesión de caja no existe o ya está cerrada' });
      return;
    }

    const sesion = sesionRes.rows[0];
    const totalEsperado = Number(sesion.monto_inicial_fondo) + Number(sesion.total_ventas_efectivo || 0);
    const diferencia = Number(monto_cierre_real) - totalEsperado;

    const result = await query(
      `UPDATE sesiones_caja 
       SET fecha_cierre = CURRENT_TIMESTAMP,
           monto_cierre_real = $1,
           diferencia_arqueo = $2,
           estado = 'cerrada'
       WHERE id_sesion_caja = $3
       RETURNING *`,
      [monto_cierre_real, diferencia, id_sesion_caja]
    );

    res.json({
      success: true,
      message: 'Caja cerrada y arqueo completado',
      data: {
        ...result.rows[0],
        totalEsperado,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
