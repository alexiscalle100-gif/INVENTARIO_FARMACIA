# 💊 FarmaControl - Sistema de Gestión e Inventario Farmacéutico

Sistema profesional completo para gestión e inventario de farmacia desarrollado con arquitectura modular en **PostgreSQL**, **Node.js (TypeScript)** y **Angular (TypeScript)**.

---

## 🏛️ 1. Estructura del Proyecto

```text
INVENTARIO FARMACIA/
├── database/                    # Scripts SQL para PostgreSQL
│   ├── 01_schema.sql           # Tablas, Enums, Índices y Relaciones (14 tablas)
│   ├── 02_views_triggers.sql   # Semáforo FEFO, triggers de lotes y vistas de stock
│   └── 03_seed_data.sql        # Medicamentos, lotes, proveedores y usuarios demo
│
├── backend/                     # API RESTful en Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Conexión PostgreSQL (Pool y Transacciones ACID)
│   │   ├── controllers/        # Controladores (POS, Kardex, Lotes, Cajas, etc.)
│   │   ├── middlewares/        # Autenticación JWT y Roles
│   │   ├── routes/             # Enrutamiento de la API (/api/...)
│   │   └── server.ts           # Servidor Express
│   └── package.json
│
└── frontend/                    # Aplicación Web SPA en Angular 17+ y Tailwind CSS
    ├── src/
    │   ├── app/
    │   │   ├── core/           # Servicios HTTP, Guards e Interceptores
    │   │   ├── models/         # Interfaces TypeScript del negocio
    │   │   └── pages/          # Vistas (Dashboard, POS, Inventario, Compras, Cajas, Recetas, Kardex)
    │   └── styles.css          # Estilos y diseño con Tailwind
    └── angular.json
```

---

## 🚀 2. Guía de Instalación y Puesta en Marcha

### Paso A: Base de Datos PostgreSQL
1. Abre **pgAdmin** o la terminal **psql** de PostgreSQL.
2. Crea la base de datos:
   ```sql
   CREATE DATABASE farmacia_db;
   ```
3. Ejecuta los scripts en orden:
   * `database/01_schema.sql`
   * `database/02_views_triggers.sql`
   * `database/03_seed_data.sql`

---

### Paso B: Backend (Node.js + TypeScript)
1. Entra a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Revisa las variables en el archivo `.env` (ajusta usuario/clave de tu PostgreSQL si es necesario):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=farmacia_db
   JWT_SECRET=super_secret_jwt_key_farmacia_2026
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *El backend estará disponible en `http://localhost:3000/api`*

---

### Paso C: Frontend (Angular + TypeScript)
1. Entra a la carpeta del frontend en una nueva terminal:
   ```bash
   cd frontend
   ```
2. Inicia la aplicación Angular:
   ```bash
   npm start
   ```
   *Abre en tu navegador: `http://localhost:4200`*

---

## 🔑 3. Cuentas de Demostración Iniciales

Todos los usuarios de prueba tienen la contraseña predeterminada: **`admin123`**

| Usuario | Rol / Cargo | Acceso Permitido |
| :--- | :--- | :--- |
| **`admin`** | Administrador | Acceso total a reportes, compras, inventario y cajas. |
| **`farmacia`** | Farmacéutico | Gestión de medicamentos, compras a laboratorios, recetas y lotes. |
| **`cajero1`** | Cajero | Punto de Venta (POS), cobros y arqueo de su sesión de caja. |

---

## ✨ 4. Características Principales Implementadas

* **Gestión de Lotes y Vencimiento (FEFO):** Despacho automático de lotes con fecha de vencimiento más próxima para evitar mermas.
* **Venta Fraccionada:** Soporte para venta por caja completa o por unidad/fracción suelta con cálculo dinámico de precio y stock.
* **Auditoría Kardex en Tiempo Real:** Cada compra o venta descuenta o añade existencias registrando el saldo resultante.
* **Control de Recetas Médicas:** Módulo para retención y archivo de prescripciones de medicamentos controlados (médico, matrícula profesional y diagnóstico).
* **Control de Sesiones de Caja y Arqueo:** Apertura de turno con fondo inicial y conciliación matemática al cierre (calcula faltante/sobrante).
