// backend/src/controllers/article.controller.ts
import { Request, Response } from 'express';
import { articleModel } from '../models';
import { ArticleFilters, UpdateArticleRequest } from '../types';
import { asyncHandler, NotFoundError } from '../services/error.service';
import { logger } from '../utils/logger';

export class ArticleController {
  /**
   * Get paginated articles with filters
   */
  getArticles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters: ArticleFilters = {
      sourceId: req.query.sourceId ? parseInt(req.query.sourceId as string) : undefined,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      isFavorite: req.query.isFavorite === 'true' ? true : req.query.isFavorite === 'false' ? false : undefined,
      search: req.query.search as string
    };

    const result = articleModel.findAll({ ...filters, page, limit });
    res.json(result);
  });

  /**
   * Get single article by ID
   */
  getArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const article = articleModel.findById(id);
    
    if (!article) {
      throw new NotFoundError('Article');
    }

    res.json(article);
  });

  /**
   * Update article (read status, favorite, etc.)
   */
  updateArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const updates: UpdateArticleRequest = req.body;

    const article = articleModel.findById(id);
    if (!article) {
      throw new NotFoundError('Article');
    }

    const updatedArticle = articleModel.update(id, updates);
    res.json(updatedArticle);
  });

  /**
   * Mark article as read
   */
  markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    const article = articleModel.findById(id);
    if (!article) {
      throw new NotFoundError('Article');
    }

    const updatedArticle = articleModel.update(id, { isRead: true });
    logger.info(`Article ${id} marked as read`);
    res.json(updatedArticle);
  });

  /**
   * Toggle article favorite status
   */
  toggleFavorite = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    const article = articleModel.findById(id);
    if (!article) {
      throw new NotFoundError('Article');
    }

    const updatedArticle = articleModel.update(id, { 
      isFavorite: !article.isFavorite 
    });
    
    if (updatedArticle) {
      logger.info(`Article ${id} favorite status toggled to ${updatedArticle.isFavorite}`);
    }
    res.json(updatedArticle);
  });

  /**
   * Archive article instead of deleting it
   */
  archiveArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    const article = articleModel.findById(id);
    if (!article) {
      throw new NotFoundError('Article');
    }

    const updatedArticle = articleModel.update(id, { isArchived: true });
    logger.info(`Article ${id} archived`);
    res.json({ message: 'Article archivé avec succès', article: updatedArticle });
  });

  /**
   * Delete article (vraie suppression, utilisé uniquement pour les favoris)
   */
  deleteArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    
    const article = articleModel.findById(id);
    if (!article) {
      throw new NotFoundError('Article');
    }

    articleModel.delete(id);
    logger.info(`Article ${id} deleted`);
    res.json({ message: 'Article deleted successfully' });
  });

  /**
   * Get article statistics
   */
  getStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stats = articleModel.getStats();
    res.json(stats);
  });

  /**
   * Delete multiple articles
   */
  deleteMultiple = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'IDs array is required' });
      return;
    }

    const deletedCount = articleModel.deleteMany(ids);
    logger.info(`Deleted ${deletedCount} articles`);
    res.json({ message: `${deletedCount} articles deleted successfully`, count: deletedCount });
  });

  /**
   * Delete all articles with optional filters
   */
  deleteAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = {
      sourceId: req.query.sourceId ? parseInt(req.query.sourceId as string) : undefined,
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined
    };

    const deletedCount = articleModel.deleteAll(filters);
    logger.info(`Deleted all articles (${deletedCount} total) with filters:`, filters);
    res.json({ message: `${deletedCount} articles deleted successfully`, count: deletedCount });
  });

  /**
   * Delete old articles
   */
  deleteOld = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const days = parseInt(req.query.days as string) || 15;
    
    const deletedCount = articleModel.deleteOldArticles(days);
    logger.info(`Deleted ${deletedCount} articles older than ${days} days`);
    res.json({ message: `${deletedCount} old articles deleted successfully`, count: deletedCount });
  });
}

// Export singleton instance
export const articleController = new ArticleController();