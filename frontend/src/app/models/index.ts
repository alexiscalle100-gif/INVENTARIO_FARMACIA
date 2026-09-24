export interface Usuario {
  id_empleado: number;
  nombre_completo: string;
  usuario: string;
  cargo_rol: 'admin' | 'farmaceutico' | 'cajero';
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export interface Ubicacion {
  id_ubicacion: number;
  pasillo: string;
  estante_anaquel: string;
  gaveta?: string;
  es_refrigerado: boolean;
}

export interface Lote {
  id_lote: number;
  id_producto: number;
  numero_lote: string;
  fecha_vencimiento: string;
  stock_actual_unidades: number;
  precio_compra_unit: number;
  estado: 'activo' | 'vencido' | 'agotado';
  dias_para_vencer?: number;
  semaforo_vencimiento?: 'VIGENTE' | 'PROXIMO_60_DIAS' | 'CRITICO_30_DIAS' | 'VENCIDO';
}

export interface Producto {
  id_producto: number;
  codigo_barras: string;
  nombre_comercial: string;
  nombre_generico: string;
  concentracion: string;
  forma_farmaceutica: string;
  id_categoria: number;
  categoria_nombre?: string;
  id_ubicacion?: number;
  pasillo?: string;
  estante_anaquel?: string;
  gaveta?: string;
  es_refrigerado?: boolean;
  requiere_receta: boolean;
  es_fraccionable: boolean;
  unidades_por_caja: number;
  precio_venta_caja: number;
  precio_venta_fraccion?: number;
  stock_minimo_alerta: number;
  stock_total?: number;
  estado_stock?: 'OPTIMO' | 'STOCK_BAJO' | 'AGOTADO';
  lotes?: Lote[];
}

export interface ItemCarrito {
  producto: Producto;
  lote: Lote;
  tipo_unidad: 'caja' | 'fraccion';
  cantidad: number;
  precio_unitario: number;
  descuento_linea: number;
  subtotal: number;
}

export interface SesionCaja {
  id_sesion_caja: number;
  id_empleado: number;
  empleado_nombre?: string;
  fecha_apertura: string;
  fecha_cierre?: string;
  monto_inicial_fondo: number;
  total_ventas_efectivo: number;
  monto_cierre_real?: number;
  diferencia_arqueo?: number;
  estado: 'abierta' | 'cerrada';
}

export interface Proveedor {
  id_proveedor: number;
  razon_social: string;
  nit_ruc: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface VentaResumen {
  id_venta: number;
  numero_comprobante: string;
  tipo_comprobante: 'ticket' | 'factura';
  fecha_venta: string;
  metodo_pago: 'efectivo' | 'tarjeta' | 'qr';
  subtotal: number;
  descuento: number;
  total_venta: number;
  empleado_nombre: string;
  cliente_nombre: string;
  total_items: number;
}
