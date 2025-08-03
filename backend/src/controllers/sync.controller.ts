// backend/src/controllers/sync.controller.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../services/error.service';
import { syncService } from '../services/sync.service';
import { syncQueueService } from '../services/sync-queue.service';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

export class SyncController {
  /**
   * Get queue status
   */
  getQueueStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const status = syncQueueService.getQueueStatus();
    res.json(status);
  });

  /**
   * Pause the sync queue
   */
  pauseQueue = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    syncQueueService.pause();
    logger.info('Sync queue paused');
    res.json({ message: 'Queue paused successfully' });
  });

  /**
   * Resume the sync queue
   */
  resumeQueue = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    syncQueueService.resume();
    logger.info('Sync queue resumed');
    res.json({ message: 'Queue resumed successfully' });
  });

  /**
   * Clear the sync queue
   */
  clearQueue = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    syncQueueService.clear();
    logger.info('Sync queue cleared');
    res.json({ message: 'Queue cleared successfully' });
  });

  /**
   * Sync all sources
   */
  syncAll = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    logger.info('Manual sync all sources requested');
    
    // Start sync asynchronously
    syncService.syncAllSources().catch(error => {
      logger.error('Error during manual sync:', error);
    });
    
    res.json({ 
      message: 'Sync started for all sources',
      timestamp: new Date()
    });
  });

  /**
   * Get cache statistics
   */
  getCacheStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stats = cacheService.getStats();
    res.json(stats);
  });

  /**
   * Clear all caches
   */
  clearCache = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    cacheService.clear();
    logger.info('All caches cleared');
    res.json({ message: 'Cache cleared successfully' });
  });
}

// Export singleton instance
export const syncController = new SyncController();
