// backend/src/services/sync-queue.service.ts
import { logger } from '../utils/logger';
import { sourceModel } from '../models';
import { rssService } from './rss.service';
import { Source } from '../types';

export interface SyncProgress {
  sourceId: number;
  sourceName: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  progress: number;
  articlesFound?: number;
  articlesNew?: number;
  error?: string;
}

export class SyncQueueService {
  private isProcessing: boolean = false;
  private queue: Source[] = [];
  private progress: Map<number, SyncProgress> = new Map();
  private listeners: ((progress: SyncProgress[]) => void)[] = [];
  private concurrency: number = 3;
  private activeCount: number = 0;
  private isPaused: boolean = false;

  constructor() {
    logger.info('SyncQueueService initialized');
  }

  /**
   * Add progress listener
   */
  onProgress(listener: (progress: SyncProgress[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emit progress update
   */
  private emitProgress(): void {
    const progress = Array.from(this.progress.values());
    this.listeners.forEach(listener => listener(progress));
  }

  /**
   * Process queue with concurrency limit
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.isPaused) return;
    
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeCount < this.concurrency && !this.isPaused) {
      const source = this.queue.shift();
      if (!source) continue;

      this.activeCount++;
      
      // Process source in background
      this.processSource(source).finally(() => {
        this.activeCount--;
        if (this.queue.length > 0 && !this.isPaused) {
          this.processQueue();
        }
      });
    }

    this.isProcessing = false;
  }

  /**
   * Process a single source
   */
  private async processSource(source: Source): Promise<void> {
    // Update status to syncing
    this.progress.set(source.id, {
      sourceId: source.id,
      sourceName: source.name,
      status: 'syncing',
      progress: 10
    });
    this.emitProgress();

    try {
      logger.info(`Starting sync for source: ${source.name}`);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const current = this.progress.get(source.id);
        if (current && current.progress < 90) {
          this.progress.set(source.id, {
            ...current,
            progress: Math.min(current.progress + 10, 90)
          });
          this.emitProgress();
        }
      }, 500);

      // Perform sync
      const result = await rssService.syncSourceArticles(source);
      
      clearInterval(progressInterval);

      // Update with results
      this.progress.set(source.id, {
        sourceId: source.id,
        sourceName: source.name,
        status: 'completed',
        progress: 100,
        articlesFound: result.found,
        articlesNew: result.new
      });
      this.emitProgress();

      // Update last sync time
      sourceModel.updateLastSync(source.id, result.errors.length > 0 ? result.errors[0] : undefined);
      
      logger.info(`Completed sync for ${source.name}: ${result.new} new articles`);
      
      // Remove from progress after 5 seconds
      setTimeout(() => {
        this.progress.delete(source.id);
        this.emitProgress();
      }, 5000);

    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Failed to sync ${source.name}:`, error);
      
      // Update with error
      this.progress.set(source.id, {
        sourceId: source.id,
        sourceName: source.name,
        status: 'failed',
        progress: 0,
        error: errorMessage
      });
      this.emitProgress();

      // Update last sync with error
      sourceModel.updateLastSync(source.id, errorMessage);
      
      // Remove from progress after 10 seconds
      setTimeout(() => {
        this.progress.delete(source.id);
        this.emitProgress();
      }, 10000);
    }
  }

  /**
   * Queue sync for a single source
   */
  async queueSourceSync(source: Source): Promise<void> {
    // Initialize progress
    this.progress.set(source.id, {
      sourceId: source.id,
      sourceName: source.name,
      status: 'pending',
      progress: 0
    });
    this.emitProgress();

    // Add to queue
    this.queue.push(source);
    
    // Start processing
    this.processQueue();
  }

  /**
   * Queue sync for all active sources
   */
  async queueAllSourcesSync(): Promise<void> {
    const sources = sourceModel.getSourcesNeedingSync();
    logger.info(`Queueing sync for ${sources.length} sources`);

    // Clear previous progress
    this.progress.clear();
    this.queue = [];

    // Add all sources to queue
    sources.forEach(source => {
      this.progress.set(source.id, {
        sourceId: source.id,
        sourceName: source.name,
        status: 'pending',
        progress: 0
      });
      this.queue.push(source);
    });
    
    this.emitProgress();
    
    // Start processing
    this.processQueue();
    
    // Wait for completion
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.queue.length === 0 && this.activeCount === 0) {
          clearInterval(checkInterval);
          logger.info('All sources sync completed');
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    size: number;
    pending: number;
    isPaused: boolean;
    progress: SyncProgress[];
  } {
    return {
      size: this.queue.length,
      pending: this.queue.length + this.activeCount,
      isPaused: this.isPaused,
      progress: Array.from(this.progress.values())
    };
  }

  /**
   * Pause the queue
   */
  pause(): void {
    this.isPaused = true;
    logger.info('Sync queue paused');
  }

  /**
   * Resume the queue
   */
  resume(): void {
    this.isPaused = false;
    logger.info('Sync queue resumed');
    this.processQueue();
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    this.progress.clear();
    this.emitProgress();
    logger.info('Sync queue cleared');
  }
}

// Export singleton instance
export const syncQueueService = new SyncQueueService();