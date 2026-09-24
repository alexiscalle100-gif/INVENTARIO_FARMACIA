import { Request, Response } from 'express';
import { query } from '../config/database';

export const getRecetas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda } = req.query;

    let sql = `
      SELECT 
        r.*,
        c.nombre_razon AS cliente_nombre,
        c.ci_nit AS cliente_documento,
        v.numero_comprobante,
        v.fecha_venta
      FROM recetas_controladas r
      JOIN clientes c ON r.id_cliente = c.id_cliente
      JOIN ventas v ON r.id_venta = v.id_venta
      WHERE 1=1
    `;

    const params: any[] = [];

    if (busqueda) {
      params.push(`%${busqueda}%`);
      sql += ` AND (r.nombre_medico ILIKE $${params.length} OR r.matricula_profesional ILIKE $${params.length} OR c.nombre_razon ILIKE $${params.length} OR c.ci_nit ILIKE $${params.length})`;
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
