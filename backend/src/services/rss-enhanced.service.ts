// backend/src/services/rss-enhanced.service.ts
import { articleModel } from '../models';
import { logger } from '../utils/logger';

export class EnhancedRSSService {
  /**
   * Clean up duplicate articles (same URL)
   */
  async cleanupDuplicates(sourceId?: number): Promise<number> {
    try {
      const duplicates = articleModel.findDuplicatesByUrl(sourceId);
      let deletedCount = 0;
      
      for (const group of duplicates) {
        // Keep the newest article, delete others
        const [keep, ...toDelete] = group.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        for (const article of toDelete) {
          articleModel.delete(article.id);
          deletedCount++;
          logger.info(`Deleted duplicate article ${article.id} (kept ${keep.id})`);
        }
      }
      
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up duplicates:', error);
      return 0;
    }
  }

  /**
   * Validate and repair article data
   */
  async validateArticles(sourceId?: number): Promise<{
    repaired: number;
    errors: string[];
  }> {
    const result = { repaired: 0, errors: [] as string[] };
    
    try {
      const articles = articleModel.findAll({ 
        sourceId, 
        limit: 1000 
      }).data;
      
      for (const article of articles) {
        const updates: any = {};
        
        // Ensure excerpt exists
        if (!article.excerpt && article.content) {
          updates.excerpt = this.generateExcerpt(article.content);
        }
        
        // Ensure description exists
        if (!article.description) {
          updates.description = article.summary || updates.excerpt || 'No description available';
        }
        
        // Validate image URL
        if (article.imageUrl && !this.isValidImageUrl(article.imageUrl)) {
          updates.imageUrl = undefined;
          result.errors.push(`Invalid image URL for article ${article.id}: ${article.imageUrl}`);
        }
        
        if (Object.keys(updates).length > 0) {
          articleModel.updateContent(article.id, updates);
          result.repaired++;
        }
      }
      
      logger.info(`Validated articles: ${result.repaired} repaired`);
    } catch (error) {
      result.errors.push(`Validation error: ${(error as Error).message}`);
    }
    
    return result;
  }

  private generateExcerpt(content: string, maxLength: number = 1000): string {
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    const cutPoint = plainText.lastIndexOf(' ', maxLength);
    return plainText.substring(0, cutPoint > 0 ? cutPoint : maxLength) + '...';
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

// Export singleton
export const enhancedRSSService = new EnhancedRSSService();
