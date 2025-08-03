// backend/src/controllers/source.controller.ts
import { Request, Response, NextFunction } from 'express';
import { sourceModel } from '../models/source.model';
import { rssService } from '../services/rss.service';
import { CreateSourceRequest } from '../types';
import { logger } from '../utils/logger';

export class SourceController {
  /**
   * Get all sources
   */
  async getSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const sources = sourceModel.findAll(activeOnly);
      res.json(sources);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single source by ID
   */
  async getSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const source = sourceModel.findById(id);
      
      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      res.json(source);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new source
   */
  async createSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sourceData: CreateSourceRequest = req.body;
      logger.info('Creating source:', sourceData);

      // Validate required fields
      if (!sourceData.name || !sourceData.url) {
        res.status(400).json({ error: 'Name and URL are required' });
        return;
      }

      // Check if source already exists
      const existingSource = sourceModel.findByUrl(sourceData.url);
      if (existingSource) {
        logger.warn('Source already exists:', existingSource);
        res.status(409).json({ error: 'Source with this URL already exists' });
        return;
      }

      // If RSS URL provided, validate it
      if (sourceData.rssUrl) {
        try {
          const isValid = await rssService.validateRSSFeed(sourceData.rssUrl);
          if (!isValid) {
            res.status(400).json({ error: 'Invalid RSS feed URL' });
            return;
          }
        } catch (error) {
          res.status(400).json({ 
            error: 'Failed to validate RSS feed', 
            message: (error as Error).message 
          });
          return;
        }
      } else {
        // Try to detect RSS feed
        try {
          const detectedFeeds = await rssService.detectRSSFeed(sourceData.url);
          if (detectedFeeds.length > 0) {
            sourceData.rssUrl = detectedFeeds[0];
            logger.info(`Auto-detected RSS feed: ${sourceData.rssUrl}`);
          }
        } catch (error) {
          logger.warn(`Failed to auto-detect RSS feed for ${sourceData.url}`);
        }
      }

      // Create the source
      logger.info('Creating source in database...');
      const source = sourceModel.create(sourceData);
      logger.info('Source created:', source);
      
      // Try to sync articles immediately
      if (source.rssUrl) {
        try {
          logger.info(`Starting initial sync for source ${source.name}...`);
          const syncResult = await rssService.syncSourceArticles(source);
          logger.info(`Initial sync completed for source ${source.name}: ${syncResult.new} new articles`);
        } catch (error) {
          logger.error(`Initial sync failed for source ${source.name}:`, error);
          // Don't fail the creation if sync fails
        }
      }

      res.status(201).json(source);
    } catch (error) {
      logger.error('Error creating source:', error);
      next(error);
    }
  }

  /**
   * Update a source
   */
  async updateSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      // If updating RSS URL, validate it
      if (updates.rssUrl) {
        try {
          const isValid = await rssService.validateRSSFeed(updates.rssUrl);
          if (!isValid) {
            res.status(400).json({ error: 'Invalid RSS feed URL' });
            return;
          }
        } catch (error) {
          res.status(400).json({ 
            error: 'Failed to validate RSS feed', 
            message: (error as Error).message 
          });
          return;
        }
      }

      const source = sourceModel.update(id, updates);
      
      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      res.json(source);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a source
   */
  async deleteSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = sourceModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test RSS feed
   */
   async testRSSFeed(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      const articles = await rssService.testFeed(url, 5);
      res.json({ 
        valid: true, 
        articlesCount: articles.length,
        articles 
      });
    } catch (error) {
      res.status(400).json({ 
        valid: false, 
        error: 'Failed to parse RSS feed', 
        message: (error as Error).message 
      });
    }
  }

  /**
   * Detect RSS feeds from a website
   */
  async detectRSSFeeds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      const feeds = await rssService.detectRSSFeed(url);
      res.json({ feeds });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sync articles for a specific source
   */
  async syncSource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const source = sourceModel.findById(id);
      
      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      if (!source.rssUrl) {
        res.status(400).json({ 
          error: 'Cette source n\'a pas d\'URL RSS.',
          suggestion: 'Utilisez RSS-Bridge (https://github.com/RSS-Bridge/rss-bridge) pour créer un flux RSS pour ce site.'
        });
        return;
      }

      const result = await rssService.syncSourceArticles(source);
      sourceModel.updateLastSync(id, result.errors.length > 0 ? result.errors.join(', ') : undefined);

      res.json({
        success: true,
        articlesFound: result.found,
        articlesNew: result.new,
        errors: result.errors
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      sourceModel.updateLastSync(parseInt(req.params.id), errorMessage);
      next(error);
    }
  }
}

// Export singleton instance
export const sourceController = new SourceController();
