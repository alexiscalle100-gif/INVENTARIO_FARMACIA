import app from './app';
import dotenv from 'dotenv';
import { pool } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Probar conexión a PostgreSQL
    const client = await pool.connect();
    console.log(' Conectado exitosamente a PostgreSQL (Farmacia DB)');
    client.release();

    app.listen(PORT, () => {
      console.log(` Servidor Backend corriendo en: http://localhost:${PORT}`);
      console.log(` API Endpoints disponibles en: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.warn('⚠️  Nota: No se pudo conectar de inmediato a PostgreSQL (asegúrese de que el servicio esté corriendo y la BD creada). Iniciando servidor...');
    app.listen(PORT, () => {
      console.log(` Servidor Backend corriendo en: http://localhost:${PORT}`);
    });
  }
};

startServer();
