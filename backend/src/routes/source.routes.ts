// backend/src/routes/source.routes.ts
import { Router } from 'express';
import { sourceController } from '../controllers/source.controller';
import { 
  validateCreateSource, 
  validateUpdateSource, 
  validateIdParam, 
  validateUrl 
} from '../middleware/validation.middleware';

const router = Router();

// GET /api/sources - Get all sources
router.get('/', sourceController.getSources);

// POST /api/sources/test-rss - Test RSS feed
router.post('/test-rss', validateUrl, sourceController.testRSSFeed);

// POST /api/sources/detect-rss - Detect RSS feeds
router.post('/detect-rss', validateUrl, sourceController.detectRSSFeeds);

// GET /api/sources/:id - Get single source
router.get('/:id', validateIdParam, sourceController.getSource);

// POST /api/sources - Create new source
router.post('/', validateCreateSource, sourceController.createSource);

// PUT /api/sources/:id - Update source
router.put('/:id', validateUpdateSource, sourceController.updateSource);

// DELETE /api/sources/:id - Delete source
router.delete('/:id', validateIdParam, sourceController.deleteSource);

// POST /api/sources/:id/sync - Sync articles for source
router.post('/:id/sync', validateIdParam, sourceController.syncSource);

export default router;
