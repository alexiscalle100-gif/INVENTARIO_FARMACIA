import { Request, Response } from 'express';
import { withTransaction, query } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RegistrarVentaDTO } from '../types';

export const registrarVenta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const {
      id_sesion_caja,
      id_cliente,
      tipo_comprobante,
      metodo_pago,
      descuento = 0,
      detalles,
      receta,
    }: RegistrarVentaDTO = req.body;

    if (!id_sesion_caja || !detalles || detalles.length === 0) {
      res.status(400).json({ success: false, message: 'Datos de venta incompletos' });
      return;
    }

    // Ejecutar en transacción atómica segura
    const result = await withTransaction(async (client) => {
      // 1. Validar que la caja esté abierta
      const cajaRes = await client.query(
        'SELECT id_sesion_caja, estado FROM sesiones_caja WHERE id_sesion_caja = $1',
        [id_sesion_caja]
      );
      if (cajaRes.rows.length === 0 || cajaRes.rows[0].estado !== 'abierta') {
        throw new Error('La sesión de caja no existe o ya está cerrada');
      }

      // 2. Generar número de comprobante único
      const compPrefix = tipo_comprobante === 'factura' ? 'FAC' : 'TCK';
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const numeroComprobante = `${compPrefix}-${Date.now().toString().slice(-6)}-${randomNum}`;

      // 3. Calcular totales y validar stock
      let subtotalVenta = 0;
      const detallesValidados: any[] = [];

      for (const item of detalles) {
        // Consultar lote y medicamento con bloqueo FOR UPDATE para concurrencia
        const loteRes = await client.query(
          `SELECT l.id_lote, l.stock_actual_unidades, l.fecha_vencimiento, l.estado,
                  p.id_producto, p.nombre_comercial, p.unidades_por_caja, p.requiere_receta,
                  p.precio_venta_caja, p.precio_venta_fraccion
           FROM lotes_inventario l
           JOIN productos_medicamentos p ON l.id_producto = p.id_producto
           WHERE l.id_lote = $1 FOR UPDATE`,
          [item.id_lote]
        );

        if (loteRes.rows.length === 0) {
          throw new Error(`Lote con ID ${item.id_lote} no encontrado`);
        }

        const lote = loteRes.rows[0];

        if (lote.estado !== 'activo' || new Date(lote.fecha_vencimiento) < new Date()) {
          throw new Error(`El lote ${lote.id_lote} de ${lote.nombre_comercial} está vencido o inactivo`);
        }

        // Calcular unidades físicas a descontar
        const unidadesDescontar = item.tipo_unidad === 'caja' 
          ? item.cantidad * lote.unidades_por_caja 
          : item.cantidad;

        if (lote.stock_actual_unidades < unidadesDescontar) {
          throw new Error(
            `Stock insuficiente en lote para ${lote.nombre_comercial}. Solicitado: ${unidadesDescontar} u., Disponible: ${lote.stock_actual_unidades} u.`
          );
        }

        const precioUnitario = item.tipo_unidad === 'caja' 
          ? Number(lote.precio_venta_caja) 
          : Number(lote.precio_venta_fraccion || lote.precio_venta_caja);

        const descLinea = item.descuento_linea || 0;
        const subtotalItem = (precioUnitario * item.cantidad) - descLinea;
        subtotalVenta += subtotalItem;

        detallesValidados.push({
          id_lote: item.id_lote,
          tipo_unidad: item.tipo_unidad,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          descuento_linea: descLinea,
          subtotal: subtotalItem,
          unidadesDescontar,
          stockActual: lote.stock_actual_unidades,
        });
      }

      const totalVenta = Math.max(0, subtotalVenta - descuento);

      // 4. Insertar cabecera de venta
      const ventaRes = await client.query(
        `INSERT INTO ventas 
         (id_sesion_caja, id_cliente, id_empleado, numero_comprobante, tipo_comprobante, metodo_pago, subtotal, descuento, total_venta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          id_sesion_caja,
          id_cliente || null,
          req.user!.id_empleado,
          numeroComprobante,
          tipo_comprobante,
          metodo_pago,
          subtotalVenta,
          descuento,
          totalVenta,
        ]
      );
      const nuevaVenta = ventaRes.rows[0];

      // 5. Insertar detalles, descontar lotes y registrar Kardex
      for (const det of detallesValidados) {
        await client.query(
          `INSERT INTO detalle_ventas (id_venta, id_lote, tipo_unidad, cantidad, precio_unitario, descuento_linea, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [nuevaVenta.id_venta, det.id_lote, det.tipo_unidad, det.cantidad, det.precio_unitario, det.descuento_linea, det.subtotal]
        );

        const nuevoStock = det.stockActual - det.unidadesDescontar;
        await client.query(
          `UPDATE lotes_inventario 
           SET stock_actual_unidades = $1,
               estado = CASE WHEN $1 = 0 THEN 'agotado' ELSE estado END
           WHERE id_lote = $2`,
          [nuevoStock, det.id_lote]
        );

        // Registro en Kardex
        await client.query(
          `INSERT INTO kardex_movimientos (id_lote, tipo_movimiento, cantidad, saldo_resultante, motivo_detalle)
           VALUES ($1, 'venta', $2, $3, $4)`,
          [det.id_lote, -det.unidadesDescontar, nuevoStock, `Venta Comprobante #${numeroComprobante}`]
        );
      }

      // 6. Registrar Receta Controlada si aplica
      if (receta && id_cliente) {
        await client.query(
          `INSERT INTO recetas_controladas 
           (id_cliente, id_venta, nombre_medico, matricula_profesional, diagnostico, receta_retenida, fecha_emision)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id_cliente,
            nuevaVenta.id_venta,
            receta.nombre_medico,
            receta.matricula_profesional,
            receta.diagnostico || 'Sin diagnóstico',
            receta.receta_retenida ?? true,
            receta.fecha_emision,
          ]
        );
      }

      // 7. Si fue en efectivo, sumar al fondo de la sesión de caja
      if (metodo_pago === 'efectivo') {
        await client.query(
          `UPDATE sesiones_caja 
           SET total_ventas_efectivo = COALESCE(total_ventas_efectivo, 0) + $1 
           WHERE id_sesion_caja = $2`,
          [totalVenta, id_sesion_caja]
        );
      }

      return nuevaVenta;
    });

    res.status(201).json({
      success: true,
      message: 'Venta procesada exitosamente',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50 } = req.query;
    const result = await query(
      `SELECT v.*, 
              e.nombre_completo AS empleado_nombre,
              COALESCE(c.nombre_razon, 'Cliente Mostrador') AS cliente_nombre,
              (SELECT COUNT(*) FROM detalle_ventas WHERE id_venta = v.id_venta)::INT AS total_items
       FROM ventas v
       JOIN empleados e ON v.id_empleado = e.id_empleado
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       ORDER BY v.fecha_venta DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
