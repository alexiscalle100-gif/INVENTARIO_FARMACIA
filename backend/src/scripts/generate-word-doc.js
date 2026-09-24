const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType
} = require('docx');

async function createWordDocument() {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const headerCell = (text, widthPct = 25) => new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: "0F766E", type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 150, right: 150 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })]
      })
    ]
  });

  const bodyCell = (text, widthPct = 25, isBold = false) => new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    margins: { top: 100, bottom: 100, left: 150, right: 150 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text, bold: isBold, size: 19, color: "1E293B" })]
      })
    ]
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
        }
      },
      children: [
        // ================= PORTADA =================
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: 'UNIVERSIDAD PRIVADA', bold: true, size: 28, color: '0F766E' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: 'FACULTAD DE INGENIERÍA DE SISTEMAS / INFORMÁTICA', bold: true, size: 22, color: '334155' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'ASIGNATURA: PROGRAMACIÓN WEB II', bold: true, size: 22, color: '0284C7' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 300 },
          children: [
            new TextRun({ text: 'PROYECTO FINAL DE GRADO', bold: true, size: 36, color: '0F172A' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ text: 'SISTEMA WEB INTEGRAL DE GESTIÓN E INVENTARIO PARA FARMACIA\n"FARMACONTROL PRO"', bold: true, size: 30, color: '0F766E' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [
            new TextRun({ text: 'Manejo Inteligente de Lotes (FEFO), Venta Fraccionada, Recetas Controladas, Arqueo de Caja y Auditoría Kardex', italics: true, size: 22, color: '64748B' }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 600 },
          children: [
            new TextRun({ text: 'Docente Guía: Docente de Programación Web II\n', bold: true, size: 20, color: '334155' }),
            new TextRun({ text: 'Año Académico: 2026', size: 20, color: '64748B' }),
          ],
        }),

        // ================= INTRODUCCIÓN =================
        new Paragraph({
          text: 'INTRODUCCIÓN',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'En el sector farmacéutico moderno, la gestión operativa y el control de inventarios trascienden la simple administración de mercadería comercial: constituyen un componente crítico de salud pública, farmacovigilancia y rentabilidad empresarial. La custodia y dispensación de medicamentos exige un control riguroso de fechas de expiración, trazabilidad de lotes de importación o laboratorio, archivo digital de recetas médicas archivadas para medicamentos controlados (psicotrópicos y antibióticos), venta fraccionada (pastillas individuales vs. cajas completas) y un cuadre matemático exacto de los turnos de caja en efectivo y canales electrónicos.'
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 300, line: 360 },
          children: [
            new TextRun({
              text: 'El presente proyecto de desarrollo tecnológico implementa "FarmaControl Pro", una plataforma web empresarial diseñada bajo un modelo de arquitectura de software desacoplada, utilizando PostgreSQL 17 como motor relacional con soporte transaccional ACID, Node.js y TypeScript en el backend para la lógica de negocio y seguridad con tokens JWT, y Angular 17+ con Tailwind CSS en el frontend para una experiencia de usuario reactiva, fluida y 100% responsiva. La solución integra el despacho logístico FEFO (First Expired, First Out), generación de comprobantes térmicos en PDF con código QR, exportación masiva a hojas de cálculo Excel y un panel de inteligencia de negocios con gráficos interactivos en tiempo real.'
            }),
          ],
        }),

        // ================= CAPÍTULO I =================
        new Paragraph({
          text: 'CAPÍTULO I: PLANTEAMIENTO DEL PROBLEMA Y OBJETIVOS',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),

        new Paragraph({
          text: '1.1. Planteamiento del Problema',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'Actualmente, numerosas farmacias y boticas gestionan sus operaciones cotidianas de manera manual o a través de herramientas de ofimática aisladas. Este paradigma operativo presenta deficiencias críticas:'
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 120, line: 320 },
          children: [
            new TextRun({ text: 'a) Mermas por vencimiento de medicamentos: ', bold: true }),
            new TextRun({ text: 'Los productos que ingresan recientemente son despachados antes que los productos más antiguos, ocasionando que los lotes con caducidad cercana queden rezagados al fondo de las estanterías y deban desecharse con la consiguiente pérdida económica.\n' }),
            new TextRun({ text: 'b) Inconsistencia en venta fraccionada: ', bold: true }),
            new TextRun({ text: 'Al abrir una caja para vender blisters o tabletas sueltas, los inventarios convencionales descuentan cajas enteras o duplican registros, generando desfasajes permanentes entre el stock físico y el lógico.\n' }),
            new TextRun({ text: 'c) Ausencia de trazabilidad en recetas retenidas: ', bold: true }),
            new TextRun({ text: 'La venta de fármacos controlados se anota en cuadernos físicos, vulnerando normativas de salud y dificultando auditorías sanitarias.\n' }),
            new TextRun({ text: 'd) Descuadres de caja y falta de conciliación: ', bold: true }),
            new TextRun({ text: 'La rotación de cajeros por turnos sin un proceso de arqueo ciego provoca discrepancias entre el efectivo recaudado y los montos reportados en ventas.' }),
          ],
        }),

        new Paragraph({
          text: '1.2. Problema Principal',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: '¿De qué manera el diseño e implementación de un sistema web integral basado en arquitectura Fullstack TypeScript (PostgreSQL 17, Node.js y Angular 17) con gestión logística FEFO, venta fraccionada, registro de recetas retenidas y arqueo de caja optimiza la eficiencia operativa, minimiza las pérdidas por mermas y garantiza la trazabilidad en una farmacia?',
              bold: true,
              italics: true,
              color: '0F766E'
            }),
          ],
        }),

        new Paragraph({
          text: '1.3. Objetivos del Proyecto',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
        }),
        new Paragraph({
          text: '1.3.1. Objetivo General',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 150, after: 80 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 180, line: 360 },
          children: [
            new TextRun({
              text: 'Desarrollar e implementar un sistema web transaccional y responsivo de gestión e inventario farmacéutico basado en un modelo de base de datos relacional de 14 tablas, con control de lotes bajo el principio FEFO, facturación en Punto de Venta (POS) con código de barras y ticket térmico PDF, auditoría Kardex, bajas por merma, archivo de recetas médicas y conciliación de caja por turnos.'
            }),
          ],
        }),
        new Paragraph({
          text: '1.3.2. Objetivos Específicos',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 150, after: 80 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 320 },
          children: [
            new TextRun({ text: '1. Diseñar el esquema de base de datos relacional en PostgreSQL 17 con 14 entidades normalizadas, llaves foráneas, checks de validación, triggers automáticos y vistas analíticas de caducidad (<30 y <60 días).\n' }),
            new TextRun({ text: '2. Construir una API RESTful modular y escalable en Node.js con TypeScript, dotada de autenticación con JSON Web Tokens (JWT), encriptación bcrypt y aislamiento transaccional ACID en ventas y compras.\n' }),
            new TextRun({ text: '3. Desarrollar una interfaz de usuario moderna en Angular 17+ con componentes Standalone y Tailwind CSS, implementando un POS con captura de scanner de código de barras, sonidos de confirmación con Web Audio API y diseño responsivo adaptativo.\n' }),
            new TextRun({ text: '4. Implementar un motor de reportes con descarga directa de comprobantes de venta en formato PDF térmico de 80mm y exportación de inventario general y movimientos de Kardex a hojas de cálculo Excel (.xlsx).\n' }),
            new TextRun({ text: '5. Implementar un módulo de bioequivalencia farmacéutica para sugerir automáticamente alternativas genéricas ante desabastecimiento de medicamentos de marca comercial.' }),
          ],
        }),

        new Paragraph({
          text: '1.4. Metodología de Desarrollo',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'Para el desarrollo del proyecto se adoptó la metodología ágil Scrum, caracterizada por entregas iterativas e incrementales en ciclos de trabajo denominados Sprints:'
            }),
          ],
        }),

        // Tabla de Sprints
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                headerCell('Sprint', 20),
                headerCell('Duración / Foco', 30),
                headerCell('Entregables Clave', 50),
              ]
            }),
            new TableRow({
              children: [
                bodyCell('Sprint 1', 20, true),
                bodyCell('Arquitectura y Base de Datos', 30),
                bodyCell('Modelo relacional de 14 tablas, DDL en PostgreSQL 17, triggers de estado de lotes y vistas analíticas.', 50),
              ]
            }),
            new TableRow({
              children: [
                bodyCell('Sprint 2', 20, true),
                bodyCell('Backend Transaccional y Auth', 30),
                bodyCell('Servidor Express + TypeScript, JWT, RBAC, Controladores de Lotes, POS con ACID, Compras y Caja.', 50),
              ]
            }),
            new TableRow({
              children: [
                bodyCell('Sprint 3', 20, true),
                bodyCell('Frontend SPA y POS', 30),
                bodyCell('Angular 17+, catálogo reactivo, Punto de Venta con lector de barras, alertas FEFO y arqueo de turnos.', 50),
              ]
            }),
            new TableRow({
              children: [
                bodyCell('Sprint 4', 20, true),
                bodyCell('Suite de Reportes y Auditoría', 30),
                bodyCell('Tickets PDF 80mm con jsPDF, exportación Excel (.xlsx), Kardex de mermas, recetas y bioequivalencias.', 50),
              ]
            }),
          ]
        }),

        // ================= CAPÍTULO II =================
        new Paragraph({
          text: 'CAPÍTULO II: MARCO TEÓRICO',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),

        new Paragraph({
          text: '2.1. Principio Logístico FEFO (First Expired, First Out)',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'El método FEFO (Primero en Expirar, Primero en Salir) es el estándar internacional de excelencia logística en farmacias y hospitales. A diferencia del método FIFO tradicional (basado en la fecha de llegada al almacén), el criterio FEFO prioriza de manera estricta la dispensación de los lotes cuya fecha de caducidad es más temprana, independientemente de cuándo fueron recepcionados. Esto minimiza las mermas y garantiza la seguridad de los pacientes.'
            }),
          ],
        }),

        new Paragraph({
          text: '2.2. Transacciones Atómicas ACID en PostgreSQL',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'En un sistema de farmacia, una venta no es una simple inserción: involucra verificar el stock del lote específico, calcular el equivalente en unidades o cajas, restar del inventario, registrar la línea en Kardex con saldo resultante, asentar la cabecera y detalle de venta, y asociar la receta médica si aplica. PostgreSQL garantiza que estas operaciones se ejecuten dentro de un bloque BEGIN ... COMMIT/ROLLBACK, cumpliendo con Atomicidad, Consistencia, Aislamiento y Durabilidad.'
            }),
          ],
        }),

        new Paragraph({
          text: '2.3. Fullstack TypeScript: Node.js, Express y Angular',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'TypeScript proporciona tipado estático tanto en el servidor (Node.js) como en el cliente (Angular 17+). Esto previene errores en tiempo de ejecución, facilita la refactorización segura y permite compartir contratos de interfaz de datos idénticos entre el backend y las vistas de usuario.'
            }),
          ],
        }),

        // ================= CAPÍTULO III =================
        new Paragraph({
          text: 'CAPÍTULO III: MARCO APLICATIVO',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),

        new Paragraph({
          text: '3.1. Diccionario de Datos del Modelo Relacional (14 Tablas)',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: 'La persistencia de datos se estructuró en 14 tablas normalizadas en PostgreSQL 17, satisfaciendo la Tercera Forma Normal (3FN):'
            }),
          ],
        }),

        // Tabla resumen de entidades
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                headerCell('Nombre de Tabla', 30),
                headerCell('Descripción Funcional', 50),
                headerCell('Tipo de Entidad', 20),
              ]
            }),
            new TableRow({ children: [bodyCell('categorias', 30, true), bodyCell('Clasificación terapéutica (Analgésicos, Antibióticos, etc.)', 50), bodyCell('Catálogo Maestro', 20)] }),
            new TableRow({ children: [bodyCell('ubicaciones_fisicas', 30, true), bodyCell('Estantes, vitrinas, pasillos y refrigeración', 50), bodyCell('Catálogo Maestro', 20)] }),
            new TableRow({ children: [bodyCell('productos_medicamentos', 30, true), bodyCell('Ficha técnica: código de barras, principio activo, concentración, venta fraccionada', 50), bodyCell('Entidad Principal', 20)] }),
            new TableRow({ children: [bodyCell('lotes_inventario', 30, true), bodyCell('Lotes con fecha de caducidad, stock en cajas/fracciones y estado FEFO', 50), bodyCell('Entidad Transaccional', 20)] }),
            new TableRow({ children: [bodyCell('proveedores_labs', 30, true), bodyCell('Laboratorios y distribuidores mayoristas', 50), bodyCell('Catálogo Maestro', 20)] }),
            new TableRow({ children: [bodyCell('compras', 30, true), bodyCell('Cabecera de compras y facturas de adquisición', 50), bodyCell('Transaccional', 20)] }),
            new TableRow({ children: [bodyCell('detalle_compras', 30, true), bodyCell('Detalle de ítems, lotes ingresados y costos unitarios', 50), bodyCell('Transaccional', 20)] }),
            new TableRow({ children: [bodyCell('kardex_movimientos', 30, true), bodyCell('Libro mayor de auditoría: ENTRADA, SALIDA_VENTA, MERMA_VENCIDO', 50), bodyCell('Auditoría', 20)] }),
            new TableRow({ children: [bodyCell('empleados', 30, true), bodyCell('Usuarios del sistema con roles ADMIN, FARMACEUTICO, CAJERO', 50), bodyCell('Seguridad', 20)] }),
            new TableRow({ children: [bodyCell('clientes', 30, true), bodyCell('Registro de compradores con CI/NIT para facturación', 50), bodyCell('Catálogo Maestro', 20)] }),
            new TableRow({ children: [bodyCell('sesiones_caja', 30, true), bodyCell('Turnos de caja con monto inicial, ventas efectivas y arqueo de cierre', 50), bodyCell('Finanzas', 20)] }),
            new TableRow({ children: [bodyCell('ventas', 30, true), bodyCell('Cabecera de ventas, método de pago, cliente y cajero', 50), bodyCell('Transaccional', 20)] }),
            new TableRow({ children: [bodyCell('detalle_ventas', 30, true), bodyCell('Líneas de venta con lote asociado, tipo (CAJA/UNIDAD) y subtotal', 50), bodyCell('Transaccional', 20)] }),
            new TableRow({ children: [bodyCell('recetas_controladas', 30, true), bodyCell('Archivo de recetas médicas: médico, matrícula profesional y diagnóstico', 50), bodyCell('Control Sanitario', 20)] }),
          ]
        }),

        new Paragraph({
          text: '3.2. Módulos y Funcionalidades del Sistema',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 120, line: 320 },
          children: [
            new TextRun({ text: '1. Dashboard y Business Intelligence: ', bold: true, color: '0F766E' }),
            new TextRun({ text: 'Resumen en tiempo real de ventas diarias, medicamentos bajo stock crítico, lotes por vencer (<30 y <60 días) y gráficos vectoriales SVG de ingresos en los últimos 7 días y distribución por categoría.\n' }),
            new TextRun({ text: '2. Punto de Venta (POS) Reactivo: ', bold: true, color: '0F766E' }),
            new TextRun({ text: 'Dispensación inteligente con selector automático del lote más próximo a caducar (FEFO), soporte para lector USB de código de barras, venta en caja completa o pastilla individual, cálculo de cambio, retroalimentación con sonidos de caja y generación instantánea de comprobante térmico en PDF de 80mm con código QR.\n' }),
            new TextRun({ text: '3. Control de Lotes y Bajas por Merma: ', bold: true, color: '0F766E' }),
            new TextRun({ text: 'Semáforo visual de caducidad (Vigente / Por Vencer / Vencido) y modal de baja directa con motivo de descarte e impacto automático en Kardex.\n' }),
            new TextRun({ text: '4. Arqueo y Conciliación de Caja: ', bold: true, color: '0F766E' }),
            new TextRun({ text: 'Apertura de turno con fondo inicial, cálculo en tiempo real de ingresos en efectivo, cobros QR y tarjeta, y conciliación matemática al cierre indicando faltantes o sobrantes.\n' }),
            new TextRun({ text: '5. Auditoría de Recetas Retenidas: ', bold: true, color: '0F766E' }),
            new TextRun({ text: 'Registro obligatorio de recetas para medicamentos psicotrópicos con datos del médico prescriptor, matrícula profesional y diagnóstico clínico.\n' }),
            new TextRun({ text: '6. Sugerencia de Genéricos Bioequivalentes: ', bold: true, color: '0F766E' }),
            new TextRun({ text: 'Algoritmo de búsqueda que recomienda alternativas terapéuticas de menor costo con el mismo principio activo y concentración.' }),
          ]
        }),

        // ================= CAPÍTULO IV =================
        new Paragraph({
          text: 'CAPÍTULO IV: CONCLUSIONES Y RECOMENDACIONES',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),

        new Paragraph({
          text: '4.1. Conclusiones',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: '1. Se logró diseñar e implementar exitosamente el sistema web "FarmaControl Pro", cumpliendo con el 100% de los requerimientos funcionales y técnicos exigidos para la gestión farmacéutica moderna.\n'
            }),
            new TextRun({
              text: '2. La implementación del principio FEFO en la base de datos PostgreSQL 17 y la capa de servicios backend previene de manera proactiva el estancamiento de medicamentos, reduciendo a cero el despacho inadvertido de productos próximos a expirar.\n'
            }),
            new TextRun({
              text: '3. La arquitectura basada en Angular 17+ Standalone Components y Tailwind CSS proporciona una interfaz táctil y responsiva de alta velocidad, optimizada tanto para computadoras de escritorio como para tablets de mostrador.\n'
            }),
            new TextRun({
              text: '4. El sistema ofrece una completa suite de reportes (tickets PDF 80mm y exportación a Excel .xlsx) y un libro mayor de Kardex transparente que respalda cualquier inspección sanitaria o financiera.'
            }),
          ],
        }),

        new Paragraph({
          text: '4.2. Recomendaciones',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 200, line: 360 },
          children: [
            new TextRun({
              text: '1. Se recomienda implementar un plan de copias de seguridad automatizadas diarias de la base de datos PostgreSQL mediante utilidades pg_dump y almacenamiento seguro en la nube.\n'
            }),
            new TextRun({
              text: '2. Para fases posteriores, se aconseja integrar una pasarela de pago digital interoperable (pagos QR directos) y conexión con los servicios de facturación electrónica del servicio de impuestos nacionales.\n'
            }),
            new TextRun({
              text: '3. Capacitar al personal farmacéutico en el registro sistemático de las recetas archivadas al momento de despachar medicamentos bajo control especial.'
            }),
          ],
        }),

        // ================= BIBLIOGRAFÍA =================
        new Paragraph({
          text: 'BIBLIOGRAFÍA',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 120, line: 320 },
          children: [
            new TextRun({ text: '1. Date, C. J. (2004). An Introduction to Database Systems (8th Edition). Addison-Wesley Publishing.\n' }),
            new TextRun({ text: '2. Freeman, A. (2023). Pro Angular 17: Build Powerful and Dynamic Web Apps. Apress.\n' }),
            new TextRun({ text: '3. Martin, R. C. (2018). Clean Architecture: A Craftsman\'s Guide to Software Structure and Design. Prentice Hall.\n' }),
            new TextRun({ text: '4. Organización Mundial de la Salud - OMS (2021). Buenas Prácticas de Almacenamiento y Distribución de Productos Farmacéuticos. Serie de Informes Técnicos No. 957, Ginebra.\n' }),
            new TextRun({ text: '5. PostgreSQL Global Development Group (2024). PostgreSQL 17.0 Documentation. https://www.postgresql.org/docs/17/\n' }),
            new TextRun({ text: '6. Schwaber, K., & Sutherland, J. (2020). La Guía de Scrum: Las Reglas del Juego. Scrum.org.' }),
          ],
        }),

        // ================= ANEXOS =================
        new Paragraph({
          text: 'ANEXOS',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 500, after: 200 },
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          spacing: { after: 150, line: 320 },
          children: [
            new TextRun({ text: '• Anexo 1: Script DDL de Creación de Base de Datos (01_schema.sql con 14 tablas y constraints).\n' }),
            new TextRun({ text: '• Anexo 2: Script de Vistas Analíticas y Triggers de Lotes (02_views_triggers.sql).\n' }),
            new TextRun({ text: '• Anexo 3: Diagrama Entidad-Relación Físico de Base de Datos.\n' }),
            new TextRun({ text: '• Anexo 4: Repositorio del Código Fuente Frontend y Backend en TypeScript con soporte Docker y Node.js.' }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const rootOutputPath = path.resolve(__dirname, '../../../DOCUMENTO_PROYECTO_FARMACIA.docx');
  const backendOutputPath = path.resolve(__dirname, '../../DOCUMENTO_PROYECTO_FARMACIA.docx');
  fs.writeFileSync(rootOutputPath, buffer);
  fs.writeFileSync(backendOutputPath, buffer);
  console.log(` DOCUMENTO WORD (.DOCX) GUARDADO EN: ${rootOutputPath}`);
}

createWordDocument().catch(console.error);
