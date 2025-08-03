// backend/src/routes/article.routes.ts
import { Router } from 'express';
import { articleController } from '../controllers/article.controller';
import { 
  validateUpdateArticle, 
  validatePagination, 
  validateIdParam 
} from '../middleware/validation.middleware';

const router = Router();

// GET /api/articles - Get paginated articles with filters
router.get('/', validatePagination, articleController.getArticles);

// GET /api/articles/stats - Get statistics
router.get('/stats', articleController.getStats);

// POST /api/articles/delete-multiple - Delete multiple articles
router.post('/delete-multiple', articleController.deleteMultiple);

// DELETE /api/articles/all - Delete all articles (DOIT ÊTRE AVANT /:id)
router.delete('/all', articleController.deleteAll);

// DELETE /api/articles/old - Delete old articles (DOIT ÊTRE AVANT /:id)
router.delete('/old', articleController.deleteOld);

// GET /api/articles/:id - Get single article
router.get('/:id', validateIdParam, articleController.getArticle);

// PUT /api/articles/:id - Update article
router.put('/:id', validateUpdateArticle, articleController.updateArticle);

// POST /api/articles/:id/read - Mark as read
router.post('/:id/read', validateIdParam, articleController.markAsRead);

// POST /api/articles/:id/favorite - Toggle favorite
router.post('/:id/favorite', validateIdParam, articleController.toggleFavorite);

// POST /api/articles/:id/archive - Archive article
router.post('/:id/archive', validateIdParam, articleController.archiveArticle);

// DELETE /api/articles/:id - Delete article
router.delete('/:id', validateIdParam, articleController.deleteArticle);

export default router;
