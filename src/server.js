import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { pool } from './config/db.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Crib Society Coffee REST API',
    docs: '/api/health',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', routes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`☕ Crib Society Server is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api`);

  // Verify database connection
  try {
    const connection = await pool.getConnection();
    console.log('📦 Database connection successfully established.');
    connection.release();
  } catch (err) {
    console.error('⚠️ Warning: Database connection failed:', err.message);
    console.error('👉 Ensure MySQL is running on Laragon and execute: npm run migrate');
  }
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Crib Society server gracefully...');
  server.close(async () => {
    await pool.end();
    console.log('👋 Database pool closed. Process terminated.');
    process.exit(0);
  });
});

export default app;
