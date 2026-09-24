import { Request, Response } from 'express';
import { query } from '../config/database';

export const getDashboardMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total ventas hoy
    const ventasHoyRes = await query(
      `SELECT COALESCE(SUM(total_venta), 0) AS total_hoy, COUNT(*) AS cantidad_ventas_hoy
       FROM ventas 
       WHERE DATE(fecha_venta) = CURRENT_DATE`
    );

    // 2. Total medicamentos y alertas de stock bajo
    const stockStatsRes = await query(
      `SELECT 
         COUNT(*) AS total_medicamentos,
         COUNT(CASE WHEN stock_total_unidades = 0 THEN 1 END) AS medicamentos_agotados,
         COUNT(CASE WHEN estado_stock = 'STOCK_BAJO' THEN 1 END) AS medicamentos_stock_bajo
       FROM v_stock_medicamentos`
    );

    // 3. Alertas de vencimiento (próximos a vencer en <= 60 días)
    const alertasVencimientoRes = await query(
      `SELECT COUNT(*) AS total_lotes_alerta
       FROM v_alertas_vencimiento
       WHERE dias_para_vencer <= 60`
    );

    // 4. Últimas 5 ventas
    const ultimasVentasRes = await query(
      `SELECT v.id_venta, v.numero_comprobante, v.total_venta, v.fecha_venta, v.metodo_pago,
              e.nombre_completo AS empleado_nombre
       FROM ventas v
       JOIN empleados e ON v.id_empleado = e.id_empleado
       ORDER BY v.fecha_venta DESC LIMIT 5`
    );

    // 5. Medicamentos más vendidos
    const topVendidosRes = await query(
      `SELECT p.nombre_comercial, SUM(dv.cantidad) AS total_unidades_vendidas
       FROM detalle_ventas dv
       JOIN lotes_inventario l ON dv.id_lote = l.id_lote
       JOIN productos_medicamentos p ON l.id_producto = p.id_producto
       GROUP BY p.id_producto, p.nombre_comercial
       ORDER BY total_unidades_vendidas DESC LIMIT 5`
    );

    // 6. Lotes con vencimiento crítico
    const lotesCriticosRes = await query(
      `SELECT * FROM v_alertas_vencimiento WHERE dias_para_vencer <= 60 ORDER BY fecha_vencimiento ASC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        ventas_hoy: ventasHoyRes.rows[0],
        stock: stockStatsRes.rows[0],
        total_lotes_alerta: alertasVencimientoRes.rows[0].total_lotes_alerta,
        ultimas_ventas: ultimasVentasRes.rows,
        top_vendidos: topVendidosRes.rows,
        lotes_criticos: lotesCriticosRes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGraficosStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Ventas de los últimos 7 días
    const ultimos7DiasRes = await query(`
      SELECT 
        TO_CHAR(d.fecha, 'DD/MM') AS dia_mes,
        TO_CHAR(d.fecha, 'Dy') AS dia_semana,
        COALESCE(SUM(v.total_venta), 0)::NUMERIC(10,2) AS total_dia,
        COUNT(v.id_venta)::INT AS cantidad_ventas
      FROM (
        SELECT CURRENT_DATE - (n || ' day')::INTERVAL AS fecha
        FROM generate_series(6, 0, -1) AS n
      ) d
      LEFT JOIN ventas v ON DATE(v.fecha_venta) = DATE(d.fecha)
      GROUP BY d.fecha
      ORDER BY d.fecha ASC
    `);

    // 2. Ventas por categoría farmacéutica
    const categoriasRes = await query(`
      SELECT 
        c.nombre AS categoria,
        COALESCE(SUM(dv.subtotal), 0)::NUMERIC(10,2) AS total_ventas,
        COUNT(dv.id_detalle_venta)::INT AS cantidad_items
      FROM categorias c
      JOIN productos_medicamentos p ON c.id_categoria = p.id_categoria
      JOIN lotes_inventario l ON p.id_producto = l.id_producto
      JOIN detalle_ventas dv ON l.id_lote = dv.id_lote
      GROUP BY c.id_categoria, c.nombre
      ORDER BY total_ventas DESC
      LIMIT 6
    `);

    // 3. Distribución por método de pago
    const metodosPagoRes = await query(`
      SELECT 
        metodo_pago,
        COUNT(*)::INT AS cantidad,
        COALESCE(SUM(total_venta), 0)::NUMERIC(10,2) AS total
      FROM ventas
      GROUP BY metodo_pago
    `);

    res.json({
      success: true,
      data: {
        ventas_7_dias: ultimos7DiasRes.rows,
        ventas_por_categoria: categoriasRes.rows,
        distribucion_pagos: metodosPagoRes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

