import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Middlewares globales
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Farmacia API' });
});

// Rutas de la API
app.use('/api', routes);

// Manejo de errores
app.use(errorHandler);

export default app;
