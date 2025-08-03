// C:\Users\Camille\Desktop\news-aggregator\backend\src\routes\index.ts
import { Router } from 'express';
import articleRoutes from './article.routes';
import sourceRoutes from './source.routes';
import categoryRoutes from './category.routes';
import syncRoutes from './sync.routes';
import settingsRoutes from './settings.routes';
import savedArticleRoutes from './saved-article.routes';

const router = Router();

// Health check for API
router.get('/', (_req, res) => {
  res.json({
    message: 'News Aggregator API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for backend status
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount routes
router.use('/articles', articleRoutes);
router.use('/sources', sourceRoutes);
router.use('/categories', categoryRoutes);
router.use('/sync', syncRoutes);
router.use('/settings', settingsRoutes);

// Saved articles routes (mounted at root level for proper routing)
router.use('/', savedArticleRoutes);

export default router;