export type RolEmpleado = 'admin' | 'farmaceutico' | 'cajero';
export type EstadoLote = 'activo' | 'vencido' | 'agotado';
export type TipoMovimientoKardex = 'compra' | 'venta' | 'merma' | 'ajuste';
export type TipoComprobante = 'ticket' | 'factura';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'qr';
export type TipoUnidadVenta = 'caja' | 'fraccion';
export type EstadoCaja = 'abierta' | 'cerrada';

export interface EmpleadoPayload {
  id_empleado: number;
  nombre_completo: string;
  usuario: string;
  cargo_rol: RolEmpleado;
}

export interface DetalleVentaItem {
  id_lote: number;
  tipo_unidad: TipoUnidadVenta;
  cantidad: number;
  precio_unitario: number;
  descuento_linea?: number;
}

export interface RegistrarVentaDTO {
  id_sesion_caja: number;
  id_cliente?: number;
  tipo_comprobante: TipoComprobante;
  metodo_pago: MetodoPago;
  descuento?: number;
  detalles: DetalleVentaItem[];
  receta?: {
    nombre_medico: string;
    matricula_profesional: string;
    diagnostico?: string;
    receta_retenida: boolean;
    fecha_emision: string;
  };
}

export interface RegistrarCompraDTO {
  id_proveedor: number;
  numero_factura_prov: string;
  detalles: {
    id_producto: number;
    numero_lote: string;
    fecha_vencimiento: string;
    cantidad: number;
    precio_compra_unit: number;
  }[];
}
