import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'farmacia_db';

async function runSetup() {
  console.log(' Conectando a PostgreSQL para inicializar la base de datos...');

  // 1. Conexión inicial a la base de datos por defecto 'postgres'
  const rootClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await rootClient.connect();

    // Verificar si la base de datos 'farmacia_db' existe
    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (checkDb.rows.length === 0) {
      console.log(` Creando base de datos "${DB_NAME}"...`);
      await rootClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(` Base de datos "${DB_NAME}" creada exitosamente.`);
    } else {
      console.log(`ℹ️  La base de datos "${DB_NAME}" ya existe.`);
    }
  } catch (err: any) {
    console.error('❌ Error al conectar o crear la base de datos:', err.message);
    console.log('💡 Sugerencia: Revisa que la contraseña en "backend/.env" coincida con tu PostgreSQL.');
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // 2. Conectarse a 'farmacia_db' y ejecutar los 3 scripts SQL
  const farmaciaClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    await farmaciaClient.connect();
    console.log(` Conectado a "${DB_NAME}". Recreando esquema limpio y ejecutando scripts SQL...`);

    // Limpiar esquema para carga fresca
    await farmaciaClient.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    const sqlFiles = [
      '01_schema.sql',
      '02_views_triggers.sql',
      '03_seed_data.sql',
    ];

    const databaseDir = path.resolve(__dirname, '../../../database');

    for (const file of sqlFiles) {
      const filePath = path.join(databaseDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Ejecutando ${file}...`);
        const sqlContent = fs.readFileSync(filePath, 'utf-8');
        await farmaciaClient.query(sqlContent);
        console.log(` ${file} ejecutado correctamente.`);
      } else {
        console.warn(`⚠️ Archivo no encontrado: ${filePath}`);
      }
    }

    console.log('\n======================================================');
    console.log(' ¡BASE DE DATOS INICIALIZADA AL 100% CON ÉXITO! ');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('❌ Error ejecutando scripts SQL:', err.message);
  } finally {
    await farmaciaClient.end();
  }
}

runSetup();
