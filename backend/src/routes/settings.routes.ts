// backend/src/routes/settings.routes.ts
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error.service';
import { userPreferencesModel } from '../models';
import { syncService } from '../services/sync.service';
import { logger } from '../utils/logger';

const router = Router();

// Get sync settings
router.get('/sync', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const settings = {
    syncInterval: parseInt(userPreferencesModel.get('sync_interval') || '30'),
    retentionDays: parseInt(userPreferencesModel.get('retention_days') || '15'),
    autoCleanup: userPreferencesModel.get('auto_cleanup') === 'true',
    maxArticlesPerSource: parseInt(userPreferencesModel.get('max_articles_per_source') || '100')
  };
  
  res.json(settings);
}));

// Update sync settings
router.put('/sync', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { syncInterval, retentionDays, autoCleanup, maxArticlesPerSource } = req.body;
  
  // Validate input
  if (syncInterval < 5 || syncInterval > 1440) {
    res.status(400).json({ error: 'Sync interval must be between 5 and 1440 minutes' });
    return;
  }
  
  if (retentionDays < 1 || retentionDays > 365) {
    res.status(400).json({ error: 'Retention days must be between 1 and 365' });
    return;
  }
  
  if (maxArticlesPerSource < 10 || maxArticlesPerSource > 1000) {
    res.status(400).json({ error: 'Max articles per source must be between 10 and 1000' });
    return;
  }
  
  // Save settings
  userPreferencesModel.set('sync_interval', syncInterval.toString());
  userPreferencesModel.set('retention_days', retentionDays.toString());
  userPreferencesModel.set('auto_cleanup', autoCleanup.toString());
  userPreferencesModel.set('max_articles_per_source', maxArticlesPerSource.toString());
  
  // Update environment variables for immediate effect
  process.env.SYNC_INTERVAL = (syncInterval * 60000).toString();
  process.env.ARTICLES_RETENTION_DAYS = retentionDays.toString();
  process.env.MAX_ARTICLES_PER_SOURCE = maxArticlesPerSource.toString();
  
  // Restart sync scheduler with new interval
  syncService.stopScheduler();
  syncService.startScheduler();
  
  logger.info('Sync settings updated:', { syncInterval, retentionDays, autoCleanup, maxArticlesPerSource });
  
  res.json({ message: 'Settings saved successfully' });
}));

export default router;