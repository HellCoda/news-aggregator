// backend/src/services/sync.service.ts
import cron from 'node-cron';
import { logger } from '../utils/logger';
import { sourceModel, articleModel } from '../models';
import { syncQueueService } from './sync-queue.service';
import { rssService } from './rss.service';
import { Source } from '../types';

class SyncService {
  private syncJob: cron.ScheduledTask | null = null;
  private isSyncing: boolean = false;
  private sourceLocks: Map<number, boolean> = new Map();
  private syncStats: Map<number, { lastSync: Date; syncing: boolean }> = new Map();

  /**
   * Start the sync scheduler
   */
  startScheduler(): void {
    // Run sync every 30 minutes
    const cronExpression = process.env.SYNC_CRON || '*/30 * * * *';
    
    this.syncJob = cron.schedule(cronExpression, () => {
      this.syncAllSources();
    });

    logger.info(`Sync scheduler started with cron expression: ${cronExpression}`);
    
    // Run initial sync after 10 seconds
    setTimeout(() => {
      this.syncAllSources();
    }, 10000);
  }

  /**
   * Stop the sync scheduler
   */
  stopScheduler(): void {
    if (this.syncJob) {
      this.syncJob.stop();
      this.syncJob = null;
      logger.info('Sync scheduler stopped');
    }
  }

  /**
   * Sync all active sources using queue
   */
  async syncAllSources(): Promise<void> {
    if (this.isSyncing) {
      logger.warn('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    logger.info('Starting queued sync for all sources...');
    const startTime = Date.now();

    try {
      // Use the queue service for batch processing
      await syncQueueService.queueAllSourcesSync();
      
      // Clean up old articles after sync
      await this.cleanupOldArticles();
      
      const duration = Date.now() - startTime;
      logger.info(`All sources sync completed in ${duration}ms`);

    } catch (error) {
      logger.error('Error during sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single source (for backward compatibility)
   */
  async syncSource(source: Source): Promise<{ found: number; new: number; errors: string[] }> {
    // Check if source is already syncing
    if (this.sourceLocks.get(source.id)) {
      logger.warn(`Sync already in progress for source: ${source.name}`);
      return { found: 0, new: 0, errors: ['Synchronisation déjà en cours'] };
    }

    // Lock the source
    this.sourceLocks.set(source.id, true);
    this.syncStats.set(source.id, { lastSync: new Date(), syncing: true });
    
    logger.info(`Syncing source: ${source.name}`);
    
    try {
      let result;
      
      if (source.rssUrl) {
        // Sync RSS source
        result = await rssService.syncSourceArticles(source);
      } else {
        throw new Error('Source has no RSS URL. Please add an RSS feed URL to this source.');
      }

      // Update last sync time
      sourceModel.updateLastSync(source.id, result.errors.length > 0 ? result.errors[0] : undefined);
      
      if (result.new > 0) {
        logger.info(`Found ${result.new} new articles for source: ${source.name}`);
      }

      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Error syncing source ${source.name}:`, error);
      sourceModel.updateLastSync(source.id, errorMessage);
      throw error;
    } finally {
      // Release lock
      this.sourceLocks.delete(source.id);
      this.syncStats.set(source.id, { lastSync: new Date(), syncing: false });
    }
  }

  /**
   * Force sync for a specific source
   */
  async forceSyncSource(sourceId: number): Promise<{ found: number; new: number; errors: string[] }> {
    const source = sourceModel.findById(sourceId);
    if (!source) {
      throw new Error('Source not found');
    }

    // Use queue for single source too
    await syncQueueService.queueSourceSync(source);
    
    // Wait a bit for the sync to complete (not ideal but maintains backward compatibility)
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const status = syncQueueService.getQueueStatus();
        const sourceProgress = status.progress.find(p => p.sourceId === sourceId);
        
        if (!sourceProgress || sourceProgress.status === 'completed' || sourceProgress.status === 'failed') {
          clearInterval(checkInterval);
          
          if (sourceProgress?.status === 'completed') {
            resolve({
              found: sourceProgress.articlesFound || 0,
              new: sourceProgress.articlesNew || 0,
              errors: []
            });
          } else {
            resolve({
              found: 0,
              new: 0,
              errors: [sourceProgress?.error || 'Sync failed']
            });
          }
        }
      }, 100);
    });
  }

  /**
   * Get sync status for all sources
   */
  getSyncStatus(): Map<number, { lastSync: Date; syncing: boolean }> {
    return new Map(this.syncStats);
  }

  /**
   * Check if a source is currently syncing
   */
  isSourceSyncing(sourceId: number): boolean {
    return this.sourceLocks.get(sourceId) || false;
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return syncQueueService.getQueueStatus();
  }

  /**
   * Clean up old articles
   */
  private async cleanupOldArticles(): Promise<void> {
    try {
      const daysToKeep = parseInt(process.env.ARTICLES_RETENTION_DAYS || '15');
      const deletedCount = articleModel.deleteOldArticles(daysToKeep);
      
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} articles older than ${daysToKeep} days`);
      }
    } catch (error) {
      logger.error('Error cleaning up old articles:', error);
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export function for backward compatibility
export function startSyncScheduler(): void {
  syncService.startScheduler();
}

// Export for server startup
export function startCronJobs(): void {
  syncService.startScheduler();
}