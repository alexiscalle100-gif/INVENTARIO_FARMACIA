import { Request, Response } from 'express';
import { query } from '../config/database';

export const getProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, categoria_id, solo_activos } = req.query;

    let sql = `
      SELECT 
        p.*,
        c.nombre AS categoria_nombre,
        u.pasillo,
        u.estante_anaquel,
        u.gaveta,
        u.es_refrigerado,
        COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0)::INT AS stock_total,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0) = 0 THEN 'AGOTADO'
          WHEN COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0) <= p.stock_minimo_alerta THEN 'STOCK_BAJO'
          ELSE 'OPTIMO'
        END AS estado_stock
      FROM productos_medicamentos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN ubicaciones_fisicas u ON p.id_ubicacion = u.id_ubicacion
      LEFT JOIN lotes_inventario l ON p.id_producto = l.id_producto
      WHERE 1=1
    `;

    const params: any[] = [];

    if (busqueda) {
      params.push(`%${busqueda}%`);
      sql += ` AND (p.nombre_comercial ILIKE $${params.length} OR p.nombre_generico ILIKE $${params.length} OR p.codigo_barras ILIKE $${params.length})`;
    }

    if (categoria_id) {
      params.push(categoria_id);
      sql += ` AND p.id_categoria = $${params.length}`;
    }

    sql += ` GROUP BY p.id_producto, c.nombre, u.pasillo, u.estante_anaquel, u.gaveta, u.es_refrigerado ORDER BY p.nombre_comercial ASC`;

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, c.nombre as categoria_nombre, u.pasillo, u.estante_anaquel, u.gaveta, u.es_refrigerado
       FROM productos_medicamentos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       LEFT JOIN ubicaciones_fisicas u ON p.id_ubicacion = u.id_ubicacion
       WHERE p.id_producto = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }

    // Consultar lotes activos del medicamento ordenados por FEFO
    const lotes = await query(
      `SELECT * FROM lotes_inventario 
       WHERE id_producto = $1 AND stock_actual_unidades > 0 
       ORDER BY fecha_vencimiento ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        lotes: lotes.rows,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      codigo_barras,
      nombre_comercial,
      nombre_generico,
      concentracion,
      forma_farmaceutica,
      id_categoria,
      id_ubicacion,
      requiere_receta,
      es_fraccionable,
      unidades_por_caja,
      precio_venta_caja,
      precio_venta_fraccion,
      stock_minimo_alerta,
    } = req.body;

    const result = await query(
      `INSERT INTO productos_medicamentos 
       (codigo_barras, nombre_comercial, nombre_generico, concentracion, forma_farmaceutica, id_categoria, id_ubicacion, requiere_receta, es_fraccionable, unidades_por_caja, precio_venta_caja, precio_venta_fraccion, stock_minimo_alerta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        codigo_barras,
        nombre_comercial,
        nombre_generico,
        concentracion,
        forma_farmaceutica,
        id_categoria,
        id_ubicacion || null,
        requiere_receta || false,
        es_fraccionable || false,
        unidades_por_caja || 1,
        precio_venta_caja,
        precio_venta_fraccion || null,
        stock_minimo_alerta || 10,
      ]
    );

    res.status(201).json({ success: true, message: 'Medicamento creado exitosamente', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategorias = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM categorias ORDER BY nombre ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUbicaciones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM ubicaciones_fisicas ORDER BY pasillo, estante_anaquel ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEquivalentes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener datos del medicamento consultado
    const prodRes = await query(
      'SELECT id_producto, nombre_generico, concentracion, forma_farmaceutica FROM productos_medicamentos WHERE id_producto = $1',
      [id]
    );

    if (prodRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }

    const med = prodRes.rows[0];

    // Buscar medicamentos con el mismo genérico y concentración
    const equivRes = await query(
      `SELECT 
        p.*,
        c.nombre AS categoria_nombre,
        COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0)::INT AS stock_total
      FROM productos_medicamentos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN lotes_inventario l ON p.id_producto = l.id_producto
      WHERE p.nombre_generico ILIKE $1 
        AND p.id_producto != $2
      GROUP BY p.id_producto, c.nombre
      ORDER BY stock_total DESC, p.precio_venta_caja ASC`,
      [`%${med.nombre_generico}%`, id]
    );

    res.json({
      success: true,
      original: med,
      data: equivRes.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

