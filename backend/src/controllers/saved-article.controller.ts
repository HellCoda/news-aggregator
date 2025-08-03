import { Request, Response, NextFunction } from 'express';
import { SavedArticleModel } from '../models/saved-article.model';

export class SavedArticleController {
  /**
   * Save an article permanently
   */
  static async saveArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { articleId } = req.params;
      const { notes, tags } = req.body;

      const savedArticle = await SavedArticleModel.saveArticle(
        parseInt(articleId),
        notes,
        tags
      );

      res.status(201).json({
        success: true,
        data: savedArticle,
        message: 'Article saved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all saved articles
   */
  static async getSavedArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, category_id, search } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      const result = await SavedArticleModel.getAll({
        limit: Number(limit),
        offset,
        category_id: category_id ? Number(category_id) : undefined,
        search: search as string
      });

      res.json({
        success: true,
        data: result.articles,
        pagination: {
          total: result.total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(result.total / Number(limit))
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get a saved article by ID
   */
  static async getSavedArticleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await SavedArticleModel.getById(parseInt(id));

      if (!article) {
        return res.status(404).json({
          success: false,
          error: 'Saved article not found'
        });
      }

      return res.json({
        success: true,
        data: article
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update a saved article (notes/tags)
   */
  static async updateSavedArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, tags } = req.body;

      const updatedArticle = await SavedArticleModel.update(
        parseInt(id),
        { notes, tags }
      );

      res.json({
        success: true,
        data: updatedArticle,
        message: 'Saved article updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete a saved article
   */
  static async deleteSavedArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await SavedArticleModel.delete(parseInt(id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Saved article not found'
        });
      }

      return res.json({
        success: true,
        message: 'Saved article deleted successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check if an article is saved
   */
  static async checkIfSaved(req: Request, res: Response, next: NextFunction) {
    try {
      const { articleId } = req.params;
      const isSaved = await SavedArticleModel.isSaved(parseInt(articleId));
      const savedArticle = isSaved 
        ? await SavedArticleModel.getByOriginalId(parseInt(articleId))
        : null;

      res.json({
        success: true,
        data: {
          isSaved,
          savedArticle
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
