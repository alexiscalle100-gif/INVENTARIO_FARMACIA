import { Response } from 'express';
import { withTransaction, query } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RegistrarCompraDTO } from '../types';

export const registrarCompra = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const { id_proveedor, numero_factura_prov, detalles }: RegistrarCompraDTO = req.body;

    if (!id_proveedor || !numero_factura_prov || !detalles || detalles.length === 0) {
      res.status(400).json({ success: false, message: 'Datos de compra incompletos' });
      return;
    }

    const result = await withTransaction(async (client) => {
      let totalCompra = 0;
      for (const item of detalles) {
        totalCompra += Number(item.precio_compra_unit) * item.cantidad;
      }

      // 1. Insertar cabecera de compra
      const compraRes = await client.query(
        `INSERT INTO compras (id_proveedor, id_empleado, numero_factura_prov, total_compra)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id_proveedor, req.user!.id_empleado, numero_factura_prov, totalCompra]
      );
      const nuevaCompra = compraRes.rows[0];

      // 2. Insertar/Actualizar lotes y detalle_compras
      for (const item of detalles) {
        // Verificar si el lote ya existe para ese producto
        const loteExistente = await client.query(
          'SELECT id_lote, stock_actual_unidades FROM lotes_inventario WHERE id_producto = $1 AND numero_lote = $2',
          [item.id_producto, item.numero_lote]
        );

        let idLote: number;
        let saldoResultante: number;

        if (loteExistente.rows.length > 0) {
          idLote = loteExistente.rows[0].id_lote;
          saldoResultante = loteExistente.rows[0].stock_actual_unidades + item.cantidad;

          await client.query(
            `UPDATE lotes_inventario 
             SET stock_actual_unidades = $1,
                 precio_compra_unit = $2,
                 fecha_vencimiento = $3,
                 estado = 'activo'
             WHERE id_lote = $4`,
            [saldoResultante, item.precio_compra_unit, item.fecha_vencimiento, idLote]
          );
        } else {
          saldoResultante = item.cantidad;
          const nuevoLoteRes = await client.query(
            `INSERT INTO lotes_inventario (id_producto, numero_lote, fecha_vencimiento, stock_actual_unidades, precio_compra_unit, estado)
             VALUES ($1, $2, $3, $4, $5, 'activo')
             RETURNING id_lote`,
            [item.id_producto, item.numero_lote, item.fecha_vencimiento, item.cantidad, item.precio_compra_unit]
          );
          idLote = nuevoLoteRes.rows[0].id_lote;
        }

        const subtotal = Number(item.precio_compra_unit) * item.cantidad;

        // Registrar detalle compra
        await client.query(
          `INSERT INTO detalle_compras (id_compra, id_lote, cantidad, precio_compra_unit, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [nuevaCompra.id_compra, idLote, item.cantidad, item.precio_compra_unit, subtotal]
        );

        // Registrar en Kardex
        await client.query(
          `INSERT INTO kardex_movimientos (id_lote, tipo_movimiento, cantidad, saldo_resultante, motivo_detalle)
           VALUES ($1, 'compra', $2, $3, $4)`,
          [idLote, item.cantidad, saldoResultante, `Compra Factura #${numero_factura_prov}`]
        );
      }

      return nuevaCompra;
    });

    res.status(201).json({ success: true, message: 'Compra registrada e inventario actualizado', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProveedores = async (_req: any, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM proveedores_labs ORDER BY razon_social ASC');
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
