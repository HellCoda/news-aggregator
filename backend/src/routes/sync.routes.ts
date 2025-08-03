// backend/src/routes/sync.routes.ts
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error.service';
import { syncService } from '../services/sync.service';
import { syncQueueService } from '../services/sync-queue.service';
import { logger } from '../utils/logger';

const router = Router();

// Get sync status
router.get('/status', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const queueStatus = syncService.getQueueStatus();
  const syncStats = syncService.getSyncStatus();
  
  // Calculate next sync time based on cron expression
  const syncInterval = parseInt(process.env.SYNC_INTERVAL || '1800000');
  const lastSyncTime = Array.from(syncStats.values())
    .filter(s => s.lastSync)
    .map(s => s.lastSync.getTime())
    .sort((a, b) => b - a)[0];
  
  const nextSyncTime = lastSyncTime ? new Date(lastSyncTime + syncInterval) : null;
  
  res.json({
    isActive: !queueStatus.isPaused,
    queueLength: queueStatus.size,
    lastSync: lastSyncTime ? new Date(lastSyncTime) : null,
    nextSync: nextSyncTime,
    progress: queueStatus.progress,
    syncStats: Object.fromEntries(syncStats)
  });
}));

// Force sync all sources
router.post('/force', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  logger.info('Force sync requested via API');
  
  // Start sync asynchronously
  syncService.syncAllSources().catch(error => {
    logger.error('Error during forced sync:', error);
  });
  
  res.json({ 
    message: 'Sync started',
    timestamp: new Date()
  });
}));

// Force sync specific source
router.post('/source/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sourceId = parseInt(req.params.id);
  
  logger.info(`Force sync requested for source ${sourceId}`);
  
  try {
    const result = await syncService.forceSyncSource(sourceId);
    res.json({
      message: 'Source synced successfully',
      ...result
    });
  } catch (error) {
    logger.error(`Error syncing source ${sourceId}:`, error);
    res.status(500).json({ error: (error as Error).message });
  }
}));

// Queue operations
router.get('/queue/status', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const status = syncQueueService.getQueueStatus();
  res.json(status);
}));

router.post('/queue/pause', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  syncQueueService.pause();
  res.json({ message: 'Queue paused' });
}));

router.post('/queue/resume', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  syncQueueService.resume();
  res.json({ message: 'Queue resumed' });
}));

// Clean up duplicates
router.post('/cleanup/duplicates', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { sourceId } = req.body;
  
  logger.info('Duplicate cleanup requested');
  
  const { enhancedRSSService } = await import('../services/rss-enhanced.service');
  const deletedCount = await enhancedRSSService.cleanupDuplicates(sourceId);
  
  res.json({
    message: `${deletedCount} duplicate articles removed`,
    count: deletedCount
  });
}));

// Validate and repair articles
router.post('/validate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { sourceId } = req.body;
  
  logger.info('Article validation requested');
  
  const { enhancedRSSService } = await import('../services/rss-enhanced.service');
  const result = await enhancedRSSService.validateArticles(sourceId);
  
  res.json({
    message: `Validation complete: ${result.repaired} articles repaired`,
    ...result
  });
}));

export default router;
