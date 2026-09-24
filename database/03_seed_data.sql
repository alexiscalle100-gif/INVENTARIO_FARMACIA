-- =============================================================================
-- SISTEMA DE GESTIÓN E INVENTARIO PARA FARMACIA
-- MOTOR: PostgreSQL 14+
-- ARCHIVO: 03_seed_data.sql
-- =============================================================================

-- 1. CATEGORÍAS
INSERT INTO categorias (nombre, descripcion) VALUES
('Analgésicos y Antiinflamatorios', 'Medicamentos para aliviar dolor e inflamación'),
('Antibióticos y Antimicrobianos', 'Medicamentos para combatir infecciones bacterianas (Venta con receta)'),
('Cardiovasculares y Antihipertensivos', 'Tratamiento para la presión arterial y sistema circulatorio'),
('Gastrointestinales', 'Antiácidos, protectores gástricos y antidiarreicos'),
('Antihistamínicos y Antialérgicos', 'Tratamientos para alergias, rinitis y congestión'),
('Vitaminas y Suplementos', 'Multivitamínicos, calcio y suplementos nutricionales'),
('Material de Curación y Primeros Auxilios', 'Gasas, alcohol, vendas, jeringas y apósitos');

-- 2. UBICACIONES FÍSICAS
INSERT INTO ubicaciones_fisicas (pasillo, estante_anaquel, gaveta, es_refrigerado) VALUES
('Pasillo A', 'Estante 1 - Nivel A', 'Gaveta 101', FALSE),
('Pasillo A', 'Estante 2 - Nivel B', 'Gaveta 102', FALSE),
('Pasillo B', 'Estante 1 - Nivel A', 'Gaveta 201', FALSE),
('Pasillo B', 'Estante 3 - Nivel C', 'Gaveta 205', FALSE),
('Refrigeración', 'Cámara Fría 1', 'Bandeja Sup-1', TRUE),
('Vitrina Controlados', 'Caja Fuerte / Vitrina 1', 'Nivel 1', FALSE);

-- 3. EMPLEADOS (Contraseña por defecto para todos: 'admin123' / hash bcrypt)
INSERT INTO empleados (ci_dni, nombre_completo, cargo_rol, usuario, password_hash, estado) VALUES
('87654321', 'Lic. Carlos Mendoza Ramos', 'admin', 'admin', '$2a$10$RTmEMRvioiPgW.jNtHZjquzyg4iZvaQEObW8DmXjIZCQ6q2nCck9e', TRUE),
('45678901', 'Dra. María Elena Torres', 'farmaceutico', 'farmacia', '$2a$10$RTmEMRvioiPgW.jNtHZjquzyg4iZvaQEObW8DmXjIZCQ6q2nCck9e', TRUE),
('78901234', 'Juan Pablo Aguilar', 'cajero', 'cajero1', '$2a$10$RTmEMRvioiPgW.jNtHZjquzyg4iZvaQEObW8DmXjIZCQ6q2nCck9e', TRUE);

-- 4. PROVEEDORES / LABORATORIOS
INSERT INTO proveedores_labs (razon_social, nit_ruc, telefono, email, direccion) VALUES
('Laboratorios Bagó S.A.', '1023456789', '+591 2 2441122', 'ventas@bago.com', 'Av. 14 de Septiembre #5200'),
('Laboratorios IFA S.A.', '1098765432', '+591 3 3456789', 'pedidos@ifa.com.bo', 'Parque Industrial Mz. 12'),
('Bayer Healthcare', '2034567890', '+591 2 2789012', 'contacto@bayer.com', 'Calle 21 Calacoto #8320'),
('Laboratorios Vita S.A.', '1011223344', '+591 2 2334455', 'distribucion@laboratoriosvita.com', 'Av. Busch #1420');

-- 5. CLIENTES
INSERT INTO clientes (ci_nit, nombre_razon, telefono, email) VALUES
('5432109', 'Roberto Gómez Fernández', '77012345', 'roberto.gomez@gmail.com'),
('6543210', 'Patricia Morales Vega', '76543210', 'patricia.m@hotmail.com'),
('0', 'Cliente Ocasional / Mostrador', '00000000', 'mostrador@farmacia.com');

-- 6. PRODUCTOS MEDICAMENTOS
INSERT INTO productos_medicamentos 
(codigo_barras, nombre_comercial, nombre_generico, concentracion, forma_farmaceutica, id_categoria, id_ubicacion, requiere_receta, es_fraccionable, unidades_por_caja, precio_venta_caja, precio_venta_fraccion, stock_minimo_alerta)
VALUES
('777123456001', 'Paracetamol Bago 500mg', 'Paracetamol', '500 mg', 'Tabletas', 1, 1, FALSE, TRUE, 100, 25.00, 0.30, 50),
('777123456002', 'Ibuprofeno Forte 400mg', 'Ibuprofeno', '400 mg', 'Cápsulas Blandas', 1, 1, FALSE, TRUE, 30, 18.00, 0.70, 30),
('777123456003', 'Amoxicilina + Ac. Clavulánico', 'Amoxicilina / Clavulanato', '875/125 mg', 'Comprimidos', 2, 2, TRUE, TRUE, 20, 45.00, 2.50, 20),
('777123456004', 'Azitromicina 500mg', 'Azitromicina', '500 mg', 'Tabletas', 2, 2, TRUE, FALSE, 3, 22.00, NULL, 15),
('777123456005', 'Losartán Potásico 50mg', 'Losartán', '50 mg', 'Comprimidos Recubiertos', 3, 3, TRUE, TRUE, 60, 36.00, 0.70, 40),
('777123456006', 'Omeprazol 20mg', 'Omeprazol', '20 mg', 'Cápsulas', 4, 3, FALSE, TRUE, 30, 15.00, 0.60, 25),
('777123456007', 'Loratadina 10mg', 'Loratadina', '10 mg', 'Tabletas', 5, 4, FALSE, TRUE, 100, 20.00, 0.25, 30),
('777123456008', 'Insulina Humana NPH', 'Insulina Humana', '100 UI/ml', 'Frasco Vial 10ml', 3, 5, TRUE, FALSE, 1, 95.00, NULL, 10),
('777123456009', 'Clonazepam 2mg (Controlado)', 'Clonazepam', '2 mg', 'Comprimidos', 1, 6, TRUE, TRUE, 30, 55.00, 2.00, 15),
('777123456010', 'Vitamina C 1000mg Efervescente', 'Ácido Ascórbico', '1000 mg', 'Tubos Efervescentes', 6, 4, FALSE, FALSE, 10, 32.00, NULL, 20);

-- 7. LOTES DE INVENTARIO (Fechas vigentes y algunas con alerta de vencimiento)
INSERT INTO lotes_inventario (id_producto, numero_lote, fecha_vencimiento, stock_actual_unidades, precio_compra_unit, estado) VALUES
(1, 'LOTE-PAR-2026A', CURRENT_DATE + INTERVAL '18 month', 200, 0.15, 'activo'),
(2, 'LOTE-IBU-2025B', CURRENT_DATE + INTERVAL '12 month', 90, 0.35, 'activo'),
(3, 'LOTE-AMX-2025C', CURRENT_DATE + INTERVAL '8 month', 60, 1.40, 'activo'),
(4, 'LOTE-AZI-2024D', CURRENT_DATE + INTERVAL '25 day', 12, 12.00, 'activo'), -- ALERTA CRÍTICA 30 DÍAS
(5, 'LOTE-LOS-2026E', CURRENT_DATE + INTERVAL '14 month', 180, 0.30, 'activo'),
(6, 'LOTE-OME-2025F', CURRENT_DATE + INTERVAL '45 day', 60, 0.25, 'activo'), -- ALERTA 60 DÍAS
(7, 'LOTE-LOR-2026G', CURRENT_DATE + INTERVAL '20 month', 300, 0.10, 'activo'),
(8, 'LOTE-INS-2025H', CURRENT_DATE + INTERVAL '6 month', 15, 65.00, 'activo'),
(9, 'LOTE-CLO-2026I', CURRENT_DATE + INTERVAL '15 month', 90, 0.90, 'activo'),
(10, 'LOTE-VIT-2026J', CURRENT_DATE + INTERVAL '10 month', 40, 18.00, 'activo');

-- 8. KARDEX INICIAL (Movimiento de Apertura/Carga Inicial de Inventario)
INSERT INTO kardex_movimientos (id_lote, tipo_movimiento, cantidad, saldo_resultante, motivo_detalle) VALUES
(1, 'ajuste', 200, 200, 'Inventario Inicial de Apertura'),
(2, 'ajuste', 90, 90, 'Inventario Inicial de Apertura'),
(3, 'ajuste', 60, 60, 'Inventario Inicial de Apertura'),
(4, 'ajuste', 12, 12, 'Inventario Inicial de Apertura'),
(5, 'ajuste', 180, 180, 'Inventario Inicial de Apertura'),
(6, 'ajuste', 60, 60, 'Inventario Inicial de Apertura'),
(7, 'ajuste', 300, 300, 'Inventario Inicial de Apertura'),
(8, 'ajuste', 15, 15, 'Inventario Inicial de Apertura'),
(9, 'ajuste', 90, 90, 'Inventario Inicial de Apertura'),
(10, 'ajuste', 40, 40, 'Inventario Inicial de Apertura');

-- 9. SESIÓN DE CAJA DEMO INICIAL (Abierta)
INSERT INTO sesiones_caja (id_empleado, fecha_apertura, monto_inicial_fondo, total_ventas_efectivo, estado) VALUES
(3, CURRENT_TIMESTAMP, 200.00, 0.00, 'abierta');
