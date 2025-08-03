// backend/src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
// import helmet from 'helmet'; - using helmetConfig from security.middleware
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as path from 'path';
import categoryRoutes from './routes/category.routes';

// Middleware imports
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { helmetConfig, apiLimiter, readLimiter, sanitizeInput } from './middleware/security.middleware';

// Route imports
import routes from './routes';

const app: Application = express();

// CORS configuration - MUST BE FIRST
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Options preflight handler for all routes
app.options('*', cors());

// Security middleware
app.use(helmetConfig);
app.disable('x-powered-by');

// Rate limiting différencié par type d'endpoint
app.use('/api/articles', readLimiter);
app.use('/api/categories', readLimiter);
app.use('/api/sources', readLimiter);
app.use('/api/health', readLimiter);

// Apply stricter rate limiting to other API routes
app.use('/api/', apiLimiter);

// Sanitize inputs
app.use(sanitizeInput);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Middleware pour s'assurer que les headers CORS sont toujours présents
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Health check endpoints (must be before other routes)
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    api: true
  });
});

// API routes
app.use('/api/categories', categoryRoutes);
app.use('/api', routes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_PATH) {
  // Servir les fichiers statiques du frontend
  app.use(express.static(process.env.FRONTEND_PATH));
  
  // Toutes les autres routes renvoient vers index.html (pour React Router)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(process.env.FRONTEND_PATH!, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;