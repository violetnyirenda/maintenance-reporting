import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import swaggerSpec from './swaggerSpec.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Check DATABASE_URL in server/.env');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
  });
}

startServer();
