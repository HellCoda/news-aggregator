// backend/src/services/cache.service.ts
import { logger } from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize: number;
  private accessOrder: string[] = [];

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    
    logger.debug(`Cache hit: ${key}`);
    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 min default
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder[0];
      this.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });

    this.updateAccessOrder(key);
    logger.debug(`Cache set: ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * Delete from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    
    if (deleted) {
      logger.debug(`Cache delete: ${key}`);
    }
    
    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    logger.debug('Cache cleared');
  }

  /**
   * Invalidate by pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    
    keysToDelete.forEach(key => this.delete(key));
    
    logger.debug(`Cache invalidated ${keysToDelete.length} entries matching: ${pattern}`);
    return keysToDelete.length;
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to track this
      misses: 0 // Would need to track this
    };
  }

  /**
   * Update LRU access order
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleaned ${cleaned} expired entries`);
    }

    return cleaned;
  }
}

// Export singleton instance
export const cacheService = new CacheService(200); // 200 entries max

// Clean expired entries every minute
setInterval(() => {
  cacheService.cleanExpired();
}, 60000);