-- =============================================================================
-- SISTEMA DE GESTIÓN E INVENTARIO PARA FARMACIA
-- MOTOR: PostgreSQL 14+
-- ARCHIVO: 02_views_triggers.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FUNCIÓN Y TRIGGER: Actualizar estado de lote al cambiar stock
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_estado_lote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_actual_unidades = 0 THEN
        NEW.estado := 'agotado';
    ELSIF NEW.fecha_vencimiento < CURRENT_DATE THEN
        NEW.estado := 'vencido';
    ELSE
        NEW.estado := 'activo';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_estado_lote ON lotes_inventario;
CREATE TRIGGER trg_actualizar_estado_lote
BEFORE INSERT OR UPDATE OF stock_actual_unidades, fecha_vencimiento ON lotes_inventario
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_estado_lote();

-- -----------------------------------------------------------------------------
-- 2. VISTA: Stock Consolidado y Alertas por Medicamento
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_stock_medicamentos AS
SELECT 
    p.id_producto,
    p.codigo_barras,
    p.nombre_comercial,
    p.nombre_generico,
    p.concentracion,
    p.forma_farmaceutica,
    c.nombre AS categoria,
    u.pasillo,
    u.estante_anaquel,
    u.gaveta,
    u.es_refrigerado,
    p.requiere_receta,
    p.es_fraccionable,
    p.unidades_por_caja,
    p.precio_venta_caja,
    p.precio_venta_fraccion,
    p.stock_minimo_alerta,
    COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0) AS stock_total_unidades,
    COUNT(CASE WHEN l.estado = 'activo' THEN l.id_lote END) AS total_lotes_activos,
    CASE 
        WHEN COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0) = 0 THEN 'AGOTADO'
        WHEN COALESCE(SUM(CASE WHEN l.estado = 'activo' THEN l.stock_actual_unidades ELSE 0 END), 0) <= p.stock_minimo_alerta THEN 'STOCK_BAJO'
        ELSE 'OPTIMO'
    END AS estado_stock
FROM productos_medicamentos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN ubicaciones_fisicas u ON p.id_ubicacion = u.id_ubicacion
LEFT JOIN lotes_inventario l ON p.id_producto = l.id_producto
GROUP BY p.id_producto, c.nombre, u.pasillo, u.estante_anaquel, u.gaveta, u.es_refrigerado;

-- -----------------------------------------------------------------------------
-- 3. VISTA: Lotes próximos a vencer (Alerta 60 días) y Vencidos (Semáforo FEFO)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_alertas_vencimiento AS
SELECT 
    l.id_lote,
    l.numero_lote,
    p.id_producto,
    p.nombre_comercial,
    p.nombre_generico,
    l.fecha_vencimiento,
    l.stock_actual_unidades,
    l.estado,
    (l.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer,
    CASE 
        WHEN l.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
        WHEN (l.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'CRITICO_30_DIAS'
        WHEN (l.fecha_vencimiento - CURRENT_DATE) <= 60 THEN 'PROXIMO_60_DIAS'
        ELSE 'VIGENTE'
    END AS semaforo_vencimiento
FROM lotes_inventario l
JOIN productos_medicamentos p ON l.id_producto = p.id_producto
WHERE l.stock_actual_unidades > 0
ORDER BY l.fecha_vencimiento ASC;
