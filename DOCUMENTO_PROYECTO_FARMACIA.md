# PROYECTO DE GRADO / ASIGNATURA: PROGRAMACIÓN WEB II

# SISTEMA WEB DE GESTIÓN E INVENTARIO PARA FARMACIA CON CONTROL DE LOTES (FEFO), PUNTO DE VENTA (POS), KARDEX Y ARQUEO DE CAJA
**Caso de Estudio: FarmaControl Pro**

---

## ÍNDICE GENERAL

- **INTRODUCCIÓN**
- **CAPÍTULO I: PLANTEAMIENTO DEL PROBLEMA Y OBJETIVOS**
  - 1.1. Planteamiento del Problema
  - 1.2. Formulación del Problema Principal
  - 1.3. Problemas Secundarios
  - 1.4. Objetivos
    - 1.4.1. Objetivo General
    - 1.4.2. Objetivos Específicos
  - 1.5. Justificación
    - 1.5.1. Justificación Técnica
    - 1.5.2. Justificación Económica
    - 1.5.3. Justificación Social y Sanitaria
  - 1.6. Alcances y Límites
  - 1.7. Metodología de Desarrollo (Scrum / Cascada Adaptada)
- **CAPÍTULO II: MARCO TEÓRICO Y CONCEPTUAL**
  - 2.1. Fundamentos Farmacéuticos y Sanitarios
    - 2.1.1. Control de Vencimientos: Principio FEFO (First Expired, First Out)
    - 2.1.2. Venta Fraccionada y Bioequivalencia (Genéricos)
    - 2.1.3. Medicamentos Controlados y Archivo de Recetas
    - 2.1.4. Trazabilidad en Kardex y Control de Mermas
  - 2.2. Tecnologías de Base de Datos
    - 2.2.1. PostgreSQL y Transacciones ACID
    - 2.2.2. Integridad Referencial y Tipos Enumerados (ENUM)
  - 2.3. Tecnologías Backend
    - 2.3.1. Node.js y Entorno de Ejecución
    - 2.3.2. TypeScript y Tipado Estricto
    - 2.3.3. Arquitectura RESTful y Autenticación JWT con Bcrypt
  - 2.4. Tecnologías Frontend
    - 2.4.1. Angular Framework y Componentes Standalone
    - 2.4.2. Programación Reactiva y Signals
    - 2.4.3. Tailwind CSS y Diseño UI/UX Médico
- **CAPÍTULO III: MARCO APLICATIVO (DESARROLLO E IMPLEMENTACIÓN)**
  - 3.1. Análisis de Requerimientos
    - 3.1.1. Requerimientos Funcionales
    - 3.1.2. Requerimientos No Funcionales
  - 3.2. Diseño de la Base de Datos
    - 3.2.1. Diccionario de Datos (14 Tablas Principales)
    - 3.2.2. Diagrama Entidad - Relación (Modelo Físico)
    - 3.2.3. Triggers y Procedimientos Almacenados
  - 3.3. Arquitectura del Software
    - 3.3.1. Diagrama de Capas (Frontend, Backend, Database)
    - 3.3.2. Seguridad y Control de Acceso por Roles (RBAC)
  - 3.4. Implementación de Módulos del Sistema
    - 3.4.1. Módulo 1: Autenticación y Seguridad Multi-Rol
    - 3.4.2. Módulo 2: Catálogo de Medicamentos y Ubicaciones Físicas
    - 3.4.3. Módulo 3: Gestión de Lotes y Semáforo FEFO
    - 3.4.4. Módulo 4: Punto de Venta (POS) y Facturación Fraccionada
    - 3.4.5. Módulo 5: Registro y Auditoría de Recetas Médicas Retenidas
    - 3.4.6. Módulo 6: Compras a Laboratorios y Proveedores
    - 3.4.7. Módulo 7: Sesiones de Caja y Arqueo Matemático
    - 3.4.8. Módulo 8: Mermas, Bajas Sanitarias y Kardex de Auditoría
    - 3.4.9. Módulo 9: Generador de Tickets Térmicos PDF (80mm) con QR y Exportación Excel
    - 3.4.10. Módulo 10: Dashboard Analítico con Gráficos Semanales y por Categoría
- **CAPÍTULO IV: CONCLUSIONES Y RECOMENDACIONES**
  - 4.1. Conclusiones
  - 4.2. Recomendaciones
- **BIBLIOGRAFÍA**
- **ANEXOS**
  - Anexo 1: Scripts DDL de PostgreSQL
  - Anexo 2: Capturas de Pantalla de la Interfaz de Usuario

---

# INTRODUCCIÓN

En la industria de la salud y el comercio minorista farmacéutico, la administración rigurosa del inventario no representa únicamente una necesidad financiera, sino una obligación sanitaria de primer orden. A diferencia de un comercio convencional, las farmacias custodian productos con fechas estrictas de expiración, medicamentos psicotrópicos y antibióticos sujetos a prescripción médica obligatoria, productos que demandan cadena de frío constante y requerimientos de venta fraccionada (dispensación por unidades sueltas o por cajas cerradas).

El presente proyecto académico y profesional, titulado **FarmaControl Pro**, surge como respuesta a los desafíos operativos experimentados por las farmacias modernas, donde los métodos manuales o sistemas genéricos provocan pérdidas económicas por medicamentos caducados (mermas), desabastecimiento de insumos críticos, errores en los cierres de caja y falta de trazabilidad en las recetas médicas.

Para resolver esta problemática de forma integral, se diseñó e implementó un sistema web de arquitectura cliente-servidor de alto rendimiento, empleando **PostgreSQL 17** como motor relacional con transacciones ACID, **Node.js con TypeScript** en el backend para la lógica de negocio transaccional y **Angular 17+ con Tailwind CSS** en el frontend para una interfaz de usuario reactiva, intuitiva y adaptable a cualquier dispositivo móvil o terminal de venta.

---

# CAPÍTULO I: PLANTEAMIENTO DEL PROBLEMA Y OBJETIVOS

## 1.1. Planteamiento del Problema
En la gestión diaria de una farmacia se presentan múltiples complejidades operativas:
1. **Pérdida por Vencimiento de Fármacos:** Sin un control automatizado de lotes, el personal suele vender los medicamentos recién ingresados antes que aquellos que tienen una fecha de caducidad próxima, generando mermas económicas cuantiosas.
2. **Discrepancias en Venta Fraccionada:** La dispensación de medicamentos por pastillas o tabletas individuales altera el conteo de cajas si el sistema no posee un algoritmo de conversión automático.
3. **Falta de Control en Recetas Médicas:** La venta de antibióticos y psicotrópicos requiere retención de receta médica según la normativa del Ministerio de Salud. La ausencia de un registro digital dificulta las auditorías sanitarias.
4. **Descuadres en Caja y Facturación:** Al finalizar turnos rotativos, la falta de una conciliación matemática entre el efectivo físico contado, cobros QR y tarjetas de débito produce inconsistencias y pérdidas.

## 1.2. Formulación del Problema Principal
> *¿De qué manera un sistema web transaccional con arquitectura modular en PostgreSQL, Node.js y Angular optimiza el control de lotes con caducidad (FEFO), la facturación fraccionada, el registro de recetas médicas y el arqueo de caja en una farmacia?*

## 1.3. Problemas Secundarios
* ¿Cómo garantizar que se vendan primero los medicamentos más próximos a vencer para reducir las mermas?
* ¿Cómo calcular de forma precisa y atómica el descuento de stock tanto en compras por caja como en ventas por fracción?
* ¿Cómo digitalizar y auditar las recetas médicas retenidas asociadas a comprobantes de venta?
* ¿Cómo automatizar el cálculo del arqueo de caja determinando faltantes o sobrantes al cierre de turno?

## 1.4. Objetivos

### 1.4.1. Objetivo General
Desarrollar e implementar un sistema web profesional de gestión e inventario farmacéutico basado en el modelo relacional físico de 14 tablas, con despacho inteligente FEFO, punto de venta (POS), auditoría Kardex, recetas controladas y arqueo de caja, utilizando **PostgreSQL**, **Node.js (TypeScript)** y **Angular**.

### 1.4.2. Objetivos Específicos
1. Modelar e implementar la base de datos relacional en **PostgreSQL 17** con restricciones de integridad, tipos ENUM, vistas analíticas y triggers de estado de lote.
2. Desarrollar una API RESTful modular en **Node.js + Express + TypeScript** con autenticación JWT, control de roles (RBAC) y transacciones atómicas ACID.
3. Construir una interfaz web SPA responsiva en **Angular 17+** con Tailwind CSS para el Punto de Venta (POS), sugerencias de genéricos, gráficos de ventas y gestión de inventario.
4. Implementar la generación e impresión de **Tickets Térmicos en PDF (80mm) con código QR** y la exportación de reportes de Kardex e Inventario a formato **Excel (.xlsx)**.
5. Diseñar un módulo de **Bajas por Merma** que preserve la trazabilidad histórica de medicamentos vencidos o dañados en el Kardex.

## 1.5. Justificación

### 1.5.1. Justificación Técnica
El uso de TypeScript en todo el stack (Fullstack TypeScript) garantiza tipado estático seguro, reduciendo errores en tiempo de ejecución. La arquitectura transaccional de PostgreSQL previene condiciones de carrera (*race conditions*) en ventas concurrentes de stock.

### 1.5.2. Justificación Económica
La implementación del algoritmo **FEFO** minimiza las pérdidas por medicamentos expirados en bodega. El control riguroso de arqueo de caja elimina fugas de dinero por cobros no registrados.

### 1.5.3. Justificación Social y Sanitaria
El archivo digital de recetas médicas garantiza el cumplimiento de la normativa sanitaria nacional, evitando la venta indiscriminada de fármacos psicotrópicos y fomentando el uso de alternativas genéricas bioequivalentes más accesibles para la población.

## 1.6. Metodología de Desarrollo
Se adoptó la metodología ágil **Scrum adaptada**, organizada en 4 Sprints:
* **Sprint 1:** Modelado relacional, DDL de PostgreSQL, triggers y seed data.
* **Sprint 2:** Arquitectura Backend, autenticación JWT, roles y servicios transaccionales.
* **Sprint 3:** Desarrollo de vistas Frontend en Angular (POS, Catálogo, Lotes, Cajas).
* **Sprint 4:** Incorporación de suite avanzada (PDF térmico, Excel, gráficos analíticos, bioequivalentes y sonido).

---

# CAPÍTULO II: MARCO TEÓRICO Y CONCEPTUAL

## 2.1. Fundamentos Farmacéuticos y Sanitarios

### 2.1.1. Principio FEFO (First Expired, First Out)
En la administración de medicamentos, el criterio FEFO establece que el primer lote en ser dispensado debe ser aquel cuya fecha de vencimiento sea la más cercana, independientemente de la fecha en que ingresó al almacén.

### 2.1.2. Venta Fraccionada y Bioequivalencia
La venta fraccionada permite vender unidades sueltas (comprimidos, sobres) a partir de una caja contenedora. La bioequivalencia hace referencia a medicamentos genéricos que comparten el mismo principio activo, concentración y forma farmacéutica que los medicamentos de marca registrada.

### 2.1.3. Trazabilidad en Kardex y Mermas
El Kardex físico es el registro cronológico y estructurado de todas las entradas (compras), salidas (ventas) y bajas (mermas) de cada producto, calculando el saldo resultante en tiempo real.

## 2.2. Tecnologías Empleadas

### 2.2.1. PostgreSQL 17
Sistema de gestión de bases de datos relacional y orientado a objetos de código abierto. Destaca por su estricto cumplimiento de las propiedades **ACID** (*Atomicidad, Consistencia, Aislamiento, Durabilidad*), esencial para evitar inconsistencias de inventario en ventas simultáneas.

### 2.2.2. Node.js y TypeScript
Entorno de ejecución JavaScript del lado del servidor basado en el motor V8 de Google. **TypeScript** agrega tipado estático, interfaces y decoradores, facilitando una arquitectura limpia y robusta.

### 2.2.3. Angular Framework
Plataforma de desarrollo frontend creada por Google basada en componentes independientes (*Standalone Components*), Signals reactivos para actualización del DOM e inyección de dependencias nativa.

---

# CAPÍTULO III: MARCO APLICATIVO (DESARROLLO E IMPLEMENTACIÓN)

## 3.1. Diccionario de Datos del Modelo Físico

El sistema se compone de **14 tablas relacionales normalizadas**:

1. **`categorias`**: Familias farmacéuticas (`id_categoria`, `nombre`, `descripcion`).
2. **`ubicaciones_fisicas`**: Ubicación en bodega/mostrador (`id_ubicacion`, `pasillo`, `estante_anaquel`, `gaveta`, `es_refrigerado`).
3. **`productos_medicamentos`**: Catálogo base (`id_producto`, `codigo_barras`, `nombre_comercial`, `nombre_generico`, `concentracion`, `forma_farmaceutica`, `requiere_receta`, `es_fraccionable`, `unidades_por_caja`, `precio_venta_caja`, `precio_venta_fraccion`, `stock_minimo_alerta`).
4. **`lotes_inventario`**: Control de vencimientos (`id_lote`, `id_producto`, `numero_lote`, `fecha_vencimiento`, `stock_actual_unidades`, `precio_compra_unit`, `estado`).
5. **`proveedores_labs`**: Laboratorios fabricantes (`id_proveedor`, `razon_social`, `nit_ruc`, `telefono`, `email`, `direccion`).
6. **`empleados`**: Personal autorizado (`id_empleado`, `ci_dni`, `nombre_completo`, `cargo_rol`, `usuario`, `password_hash`, `estado`).
7. **`sesiones_caja`**: Turnos y arqueos (`id_sesion_caja`, `id_empleado`, `fecha_apertura`, `fecha_cierre`, `monto_inicial_fondo`, `total_ventas_efectivo`, `monto_cierre_real`, `diferencia_arqueo`, `estado`).
8. **`compras`**: Facturas de proveedores (`id_compra`, `id_proveedor`, `id_empleado`, `numero_factura_prov`, `fecha_compra`, `total_compra`).
9. **`detalle_compras`**: Ítems comprados (`id_detalle_compra`, `id_compra`, `id_lote`, `cantidad`, `precio_compra_unit`, `subtotal`).
10. **`kardex_movimientos`**: Auditoría de movimientos (`id_movimiento`, `id_lote`, `tipo_movimiento`, `cantidad`, `saldo_resultante`, `motivo_detalle`, `fecha_hora`).
11. **`clientes`**: Padrón de clientes (`id_cliente`, `ci_nit`, `nombre_razon`, `telefono`, `email`).
12. **`ventas`**: Comprobantes emitidos (`id_venta`, `id_sesion_caja`, `id_cliente`, `id_empleado`, `numero_comprobante`, `tipo_comprobante`, `fecha_venta`, `metodo_pago`, `subtotal`, `descuento`, `total_venta`).
13. **`detalle_ventas`**: Ítems vendidos (`id_detalle_venta`, `id_venta`, `id_lote`, `tipo_unidad`, `cantidad`, `precio_unitario`, `descuento_linea`, `subtotal`).
14. **`recetas_controladas`**: Archivo de prescripciones (`id_receta`, `id_cliente`, `id_venta`, `nombre_medico`, `matricula_profesional`, `diagnostico`, `receta_retenida`, `fecha_emision`).

---

## 3.2. Módulos Implementados

### Módulo 1: Autenticación y Control de Roles (RBAC)
Permite el acceso seguro al sistema mediante tokens **JWT** y cifrado unidireccional de contraseñas con **Bcrypt**. Define 3 niveles de privilegios:
* **Admin:** Control total de compras, catálogo, reportes y configuración.
* **Farmacéutico:** Registro de medicamentos, recepción de compras y recetas.
* **Cajero:** Facturación en POS, cobros y arqueo de su sesión de caja.

### Módulo 2: Punto de Venta (POS) con Despacho FEFO
* **Búsqueda Rápida:** Filtrado reactivo por código de barras, nombre comercial o genérico.
* **Lector de Código de Barras:** Detección de pistolas lectoras USB en tiempo real.
* **Venta Fraccionada:** Selección dinámica entre caja completa o pastilla individual.
* **Sugerencia de Genéricos:** Botón para consultar bioequivalentes con el mismo principio activo.
* **Impresión de Ticket Térmico:** Generación automática de comprobante PDF (80mm) con código QR.

### Módulo 3: Semáforo de Vencimiento y Mermas
* **Semáforo Visual:** Clasificación automática de lotes (Verde: vigente, Amarillo: vence en $<60$ días, Rojo: vence en $<30$ días o vencido).
* **Baja por Merma:** Modal para dar de baja unidades dañadas o vencidas con registro obligatorio en Kardex.

### Módulo 4: Arqueo y Cierre de Caja
* **Apertura de Turno:** Registro del fondo inicial en efectivo.
* **Conciliación Matemática:** Cálculo automático de:
  $$\text{Diferencia de Arqueo} = \text{Monto Real en Gaveta} - (\text{Fondo Inicial} + \text{Ventas en Efectivo})$$
* **Determinación de Faltante/Sobrante:** Mensaje inmediato al cajero y registro en base de datos.

### Módulo 5: Dashboard Analítico
* Gráficos interactivos de ingresos en los últimos 7 días.
* Distribución porcentual de ventas por categoría terapéutica.
* Alertas prioritarias de lotes críticos y productos por debajo del stock mínimo.

---

# CAPÍTULO IV: CONCLUSIONES Y RECOMENDACIONES

## 4.1. Conclusiones
1. Se cumplió con el desarrollo integral del sistema **FarmaControl Pro**, integrando las 14 tablas del modelo relacional físico en **PostgreSQL 17**, con transacciones atómicas seguras que garantizan consistencia absoluta de stock.
2. La implementación del algoritmo **FEFO** en el POS reduce drásticamente las pérdidas por medicamentos caducados al priorizar automáticamente el despacho de los lotes más antiguos.
3. El módulo de **Recetas Controladas** y el **Kardex de Mermas** dotan a la farmacia de herramientas de auditoría conformes a las exigencias normativas sanitarias.
4. La interfaz desarrollada en **Angular y Tailwind CSS** ofrece una experiencia 100% responsiva y amigable tanto en computadoras de escritorio como en terminales táctiles y dispositivos móviles.

## 4.2. Recomendaciones
1. Realizar copias de seguridad periódicas (*backups*) automatizadas de la base de datos `farmacia_db` mediante tareas cron de PostgreSQL (`pg_dump`).
2. Capacitar al personal cajero y farmacéutico en el uso correcto de la pistola de código de barras para acelerar los tiempos de atención en horas pico.
3. En una siguiente fase, integrar facturación electrónica en línea mediante servicios web de la entidad tributaria nacional e integración con pasarelas de pago QR interoperables.

---

# BIBLIOGRAFÍA

1. **Date, C. J. (2004).** *An Introduction to Database Systems (8th Edition)*. Addison-Wesley.
2. **PostgreSQL Global Development Group (2024).** *PostgreSQL 17 Documentation*. Recuperado de https://www.postgresql.org/docs/17/
3. **Freeman, A. (2023).** *Pro Angular 17 (6th Edition)*. Apress.
4. **Banks, A. & Porcello, E. (2020).** *Learning React and Node Architecture*. O'Reilly Media.
5. **Organización Mundial de la Salud (OMS) (2021).** *Buenas prácticas de almacenamiento y distribución de productos farmacéuticos*. Ginebra: OMS.
