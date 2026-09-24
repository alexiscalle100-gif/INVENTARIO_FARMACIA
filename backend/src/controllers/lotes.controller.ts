import { Request, Response } from 'express';
import { query } from '../config/database';

export const getLotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_producto, estado } = req.query;

    let sql = `
      SELECT 
        l.*,
        p.nombre_comercial,
        p.nombre_generico,
        p.unidades_por_caja,
        (l.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer,
        CASE 
          WHEN l.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
          WHEN (l.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'CRITICO_30_DIAS'
          WHEN (l.fecha_vencimiento - CURRENT_DATE) <= 60 THEN 'PROXIMO_60_DIAS'
          ELSE 'VIGENTE'
        END AS semaforo_vencimiento
      FROM lotes_inventario l
      JOIN productos_medicamentos p ON l.id_producto = p.id_producto
      WHERE 1=1
    `;

    const params: any[] = [];

    if (id_producto) {
      params.push(id_producto);
      sql += ` AND l.id_producto = $${params.length}`;
    }

    if (estado) {
      params.push(estado);
      sql += ` AND l.estado = $${params.length}`;
    }

    sql += ` ORDER BY l.fecha_vencimiento ASC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlertasVencimiento = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM v_alertas_vencimiento ORDER BY fecha_vencimiento ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKardex = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_lote, limit = 100 } = req.query;

    let sql = `
      SELECT 
        k.*,
        l.numero_lote,
        p.nombre_comercial,
        p.nombre_generico
      FROM kardex_movimientos k
      JOIN lotes_inventario l ON k.id_lote = l.id_lote
      JOIN productos_medicamentos p ON l.id_producto = p.id_producto
      WHERE 1=1
    `;

    const params: any[] = [];

    if (id_lote) {
      params.push(id_lote);
      sql += ` AND k.id_lote = $${params.length}`;
    }

    params.push(limit);
    sql += ` ORDER BY k.fecha_hora DESC LIMIT $${params.length}`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registrarMerma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_lote, cantidad, motivo } = req.body;

    if (!id_lote || !cantidad || cantidad <= 0 || !motivo) {
      res.status(400).json({ success: false, message: 'Datos incompletos para procesar la merma' });
      return;
    }

    const { withTransaction } = await import('../config/database');

    const result = await withTransaction(async (client) => {
      // 1. Obtener lote con bloqueo
      const loteRes = await client.query(
        'SELECT id_lote, stock_actual_unidades, estado FROM lotes_inventario WHERE id_lote = $1 FOR UPDATE',
        [id_lote]
      );

      if (loteRes.rows.length === 0) {
        throw new Error('Lote no encontrado');
      }

      const lote = loteRes.rows[0];
      if (lote.stock_actual_unidades < cantidad) {
        throw new Error(`Stock insuficiente en lote. Disponible: ${lote.stock_actual_unidades} u.`);
      }

      const nuevoStock = lote.stock_actual_unidades - cantidad;

      // 2. Actualizar stock del lote
      await client.query(
        `UPDATE lotes_inventario 
         SET stock_actual_unidades = $1,
             estado = CASE WHEN $1 = 0 THEN 'agotado' ELSE estado END
         WHERE id_lote = $2`,
        [nuevoStock, id_lote]
      );

      // 3. Registrar movimiento en Kardex de tipo 'merma'
      const kardexRes = await client.query(
        `INSERT INTO kardex_movimientos (id_lote, tipo_movimiento, cantidad, saldo_resultante, motivo_detalle)
         VALUES ($1, 'merma', $2, $3, $4)
         RETURNING *`,
        [id_lote, -cantidad, nuevoStock, `Baja por Merma: ${motivo}`]
      );

      return {
        id_lote,
        cantidad_dada_de_baja: cantidad,
        nuevo_saldo: nuevoStock,
        kardex: kardexRes.rows[0],
      };
    });

    res.status(201).json({
      success: true,
      message: 'Baja por merma registrada exitosamente en inventario y Kardex',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

