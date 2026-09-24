-- =============================================================================
-- SISTEMA DE GESTIÓN E INVENTARIO PARA FARMACIA (MODELO FÍSICO COMPLETO)
-- MOTOR: PostgreSQL 14+
-- ARCHIVO: 01_schema.sql
-- =============================================================================

-- Habilitar extensión para UUIDs si se requiere
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TIPOS ENUMERADOS (ENUMS)
-- =============================================================================

CREATE TYPE rol_empleado AS ENUM ('admin', 'farmaceutico', 'cajero');
CREATE TYPE estado_lote AS ENUM ('activo', 'vencido', 'agotado');
CREATE TYPE tipo_movimiento_kardex AS ENUM ('compra', 'venta', 'merma', 'ajuste');
CREATE TYPE tipo_comprobante AS ENUM ('ticket', 'factura');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta', 'qr');
CREATE TYPE tipo_unidad_venta AS ENUM ('caja', 'fraccion');
CREATE TYPE estado_caja AS ENUM ('abierta', 'cerrada');

-- =============================================================================
-- 2. TABLAS DEL SISTEMA
-- =============================================================================

-- Tabla: CATEGORIAS
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(250)
);

-- Tabla: UBICACIONES_FISICAS
CREATE TABLE ubicaciones_fisicas (
    id_ubicacion SERIAL PRIMARY KEY,
    pasillo VARCHAR(50) NOT NULL,
    estante_anaquel VARCHAR(50) NOT NULL,
    gaveta VARCHAR(50),
    es_refrigerado BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla: PRODUCTOS_MEDICAMENTOS
CREATE TABLE productos_medicamentos (
    id_producto SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre_comercial VARCHAR(150) NOT NULL,
    nombre_generico VARCHAR(150) NOT NULL,
    concentracion VARCHAR(80),
    forma_farmaceutica VARCHAR(80) NOT NULL, -- ej: Tabletas, Jarabe, Ampolla
    id_categoria INT NOT NULL REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
    id_ubicacion INT REFERENCES ubicaciones_fisicas(id_ubicacion) ON DELETE SET NULL,
    requiere_receta BOOLEAN NOT NULL DEFAULT FALSE,
    es_fraccionable BOOLEAN NOT NULL DEFAULT FALSE,
    unidades_por_caja INT NOT NULL DEFAULT 1 CHECK (unidades_por_caja >= 1),
    precio_venta_caja NUMERIC(10, 2) NOT NULL CHECK (precio_venta_caja >= 0),
    precio_venta_fraccion NUMERIC(10, 2) CHECK (precio_venta_fraccion >= 0),
    stock_minimo_alerta INT NOT NULL DEFAULT 10 CHECK (stock_minimo_alerta >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: LOTES_INVENTARIO (Control de Lotes y Vencimientos FEFO)
CREATE TABLE lotes_inventario (
    id_lote SERIAL PRIMARY KEY,
    id_producto INT NOT NULL REFERENCES productos_medicamentos(id_producto) ON DELETE RESTRICT,
    numero_lote VARCHAR(80) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    stock_actual_unidades INT NOT NULL DEFAULT 0 CHECK (stock_actual_unidades >= 0),
    precio_compra_unit NUMERIC(10, 2) NOT NULL CHECK (precio_compra_unit >= 0),
    estado estado_lote NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_producto_lote UNIQUE (id_producto, numero_lote)
);

-- Tabla: PROVEEDORES_LABS
CREATE TABLE proveedores_labs (
    id_proveedor SERIAL PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    nit_ruc VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    email VARCHAR(100),
    direccion VARCHAR(200)
);

-- Tabla: EMPLEADOS (Usuarios del sistema)
CREATE TABLE empleados (
    id_empleado SERIAL PRIMARY KEY,
    ci_dni VARCHAR(30) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo_rol rol_empleado NOT NULL DEFAULT 'cajero',
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: SESIONES_CAJA (Turnos y Arqueos de Caja)
CREATE TABLE sesiones_caja (
    id_sesion_caja SERIAL PRIMARY KEY,
    id_empleado INT NOT NULL REFERENCES empleados(id_empleado) ON DELETE RESTRICT,
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    monto_inicial_fondo NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (monto_inicial_fondo >= 0),
    total_ventas_efectivo NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_ventas_efectivo >= 0),
    monto_cierre_real NUMERIC(10, 2) CHECK (monto_cierre_real >= 0),
    diferencia_arqueo NUMERIC(10, 2) DEFAULT 0.00,
    estado estado_caja NOT NULL DEFAULT 'abierta'
);

-- Tabla: COMPRAS (Cabecera de Compras a Proveedores)
CREATE TABLE compras (
    id_compra SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores_labs(id_proveedor) ON DELETE RESTRICT,
    id_empleado INT NOT NULL REFERENCES empleados(id_empleado) ON DELETE RESTRICT,
    numero_factura_prov VARCHAR(80) NOT NULL,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_compra NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_compra >= 0)
);

-- Tabla: DETALLE_COMPRAS
CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
    id_lote INT NOT NULL REFERENCES lotes_inventario(id_lote) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_compra_unit NUMERIC(10, 2) NOT NULL CHECK (precio_compra_unit >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Tabla: KARDEX_MOVIMIENTOS (Trazabilidad y Auditoría de Stock)
CREATE TABLE kardex_movimientos (
    id_movimiento SERIAL PRIMARY KEY,
    id_lote INT NOT NULL REFERENCES lotes_inventario(id_lote) ON DELETE RESTRICT,
    tipo_movimiento tipo_movimiento_kardex NOT NULL,
    cantidad INT NOT NULL, -- positivo para entradas, negativo o valor absoluto según convención
    saldo_resultante INT NOT NULL CHECK (saldo_resultante >= 0),
    motivo_detalle VARCHAR(250),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: CLIENTES
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    ci_nit VARCHAR(30) NOT NULL UNIQUE,
    nombre_razon VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    email VARCHAR(100)
);

-- Tabla: VENTAS (Cabecera de Facturación / POS)
CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    id_sesion_caja INT NOT NULL REFERENCES sesiones_caja(id_sesion_caja) ON DELETE RESTRICT,
    id_cliente INT REFERENCES clientes(id_cliente) ON DELETE SET NULL,
    id_empleado INT NOT NULL REFERENCES empleados(id_empleado) ON DELETE RESTRICT,
    numero_comprobante VARCHAR(50) NOT NULL UNIQUE,
    tipo_comprobante tipo_comprobante NOT NULL DEFAULT 'ticket',
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metodo_pago metodo_pago NOT NULL DEFAULT 'efectivo',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    descuento NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (descuento >= 0),
    total_venta NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_venta >= 0)
);

-- Tabla: DETALLE_VENTAS (Detalle de Facturación / Venta por Caja o Fracción)
CREATE TABLE detalle_ventas (
    id_detalle_venta SERIAL PRIMARY KEY,
    id_venta INT NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_lote INT NOT NULL REFERENCES lotes_inventario(id_lote) ON DELETE RESTRICT,
    tipo_unidad tipo_unidad_venta NOT NULL DEFAULT 'caja',
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    descuento_linea NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (descuento_linea >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Tabla: RECETAS_CONTROLADAS (Medicamentos bajo receta médica archivada)
CREATE TABLE recetas_controladas (
    id_receta SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_venta INT NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    nombre_medico VARCHAR(150) NOT NULL,
    matricula_profesional VARCHAR(60) NOT NULL,
    diagnostico VARCHAR(250),
    receta_retenida BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_emision DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. ÍNDICES DE ALTO RENDIMIENTO
-- =============================================================================

CREATE INDEX idx_productos_cod_barras ON productos_medicamentos(codigo_barras);
CREATE INDEX idx_productos_nombre ON productos_medicamentos(nombre_comercial, nombre_generico);
CREATE INDEX idx_lotes_fefo ON lotes_inventario(id_producto, fecha_vencimiento, estado);
CREATE INDEX idx_kardex_lote_fecha ON kardex_movimientos(id_lote, fecha_hora DESC);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta DESC);
CREATE INDEX idx_ventas_sesion ON ventas(id_sesion_caja);
