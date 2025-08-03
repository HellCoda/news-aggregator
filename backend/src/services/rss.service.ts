// backend/src/services/rss.service.ts
import Parser from 'rss-parser';
import { Article, Source } from '../types';
import { logger } from '../utils/logger';
import { articleModel } from '../models';
import { sanitizeHtml } from './error.service';

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  isoDate?: string;
  creator?: string;
  author?: string;
  'content:encoded'?: string;
  'content:encodedSnippet'?: string;
  summary?: string;
  'dc:creator'?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  'media:thumbnail'?: any;
  'media:content'?: any;
}

export class RSSService {
  private parser: Parser<any, RSSItem>;

  constructor() {
    this.parser = new Parser({
      timeout: 15000, // 15 seconds timeout
      headers: {
        'User-Agent': 'News Aggregator/1.0',
      },
      customFields: {
        item: [
          ['content:encoded', 'content:encoded'],
          ['dc:creator', 'dc:creator'],
          ['summary', 'summary'],
          ['media:thumbnail', 'media:thumbnail', {keepArray: true}],
          ['media:content', 'media:content', {keepArray: true}]
        ]
      }
    });
  }

  /**
   * Extract image URL from RSS item - Enhanced version
   */
  private extractImageUrl(item: RSSItem, content?: string): string | undefined {
    // 1. Check media:thumbnail (can be array or single object)
    if (item['media:thumbnail']) {
      const thumbnails = Array.isArray(item['media:thumbnail']) 
        ? item['media:thumbnail'] 
        : [item['media:thumbnail']];
      
      for (const thumbnail of thumbnails) {
        if (thumbnail?.$?.url) {
          return thumbnail.$.url;
        }
      }
    }

    // 2. Check media:content (can be array or single object)
    if (item['media:content']) {
      const mediaContents = Array.isArray(item['media:content']) 
        ? item['media:content'] 
        : [item['media:content']];
      
      for (const media of mediaContents) {
        if (media?.$?.url) {
          // Accept if:
          // - medium is explicitly "image"
          // - no medium is specified (could be image)
          // - URL looks like an image
          const url = media.$.url;
          const isImage = media.$.medium === 'image' || 
                         !media.$.medium || 
                         /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(url);
          
          if (isImage) {
            return url;
          }
        }
      }
    }

    // 3. Check enclosure
    if (item.enclosure?.url) {
      if (item.enclosure.type?.startsWith('image/') || 
          /\.(jpg|jpeg|png|gif|webp)($|\?)/i.test(item.enclosure.url)) {
        return item.enclosure.url;
      }
    }

    // 4. Extract from content HTML
    if (content) {
      // Try multiple patterns for maximum compatibility
      const patterns = [
        /<img[^>]+src=["']([^"']+)["']/i,
        /<img[^>]+src=([^\s>]+)/i,
        /src=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)/i
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    // 5. Check description or summary for images
    const textContent = item.summary || '';
    if (textContent) {
      const imgMatch = textContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }

    return undefined;
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string | undefined, maxLength: number = 1000): string | undefined {
    if (!content) return undefined;

    // Remove HTML tags
    let plainText = content.replace(/<[^>]*>/g, ' ');
    
    // Remove extra whitespace
    plainText = plainText.replace(/\s+/g, ' ').trim();
    
    // Remove common RSS artifacts
    plainText = plainText.replace(/\[...\]|\[\u2026\]/g, '');
    
    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Try to cut at sentence end
    const sentenceEnd = plainText.lastIndexOf('.', maxLength);
    if (sentenceEnd > maxLength * 0.8) {
      return plainText.substring(0, sentenceEnd + 1);
    }

    // Otherwise cut at word boundary
    const wordEnd = plainText.lastIndexOf(' ', maxLength);
    if (wordEnd > maxLength * 0.8) {
      return plainText.substring(0, wordEnd) + '...';
    }

    // Last resort: hard cut
    return plainText.substring(0, maxLength - 3) + '...';
  }

  /**
   * Extract first two paragraphs from content
   */
  private extractFirstParagraphs(content: string | undefined, count: number = 6): string | undefined {
    if (!content) return undefined;

    // Split by paragraph tags
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
    const paragraphs: string[] = [];
    let match;

    while ((match = paragraphRegex.exec(content)) !== null && paragraphs.length < count) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      if (text.length > 20) { // Ignore very short paragraphs
        paragraphs.push(text);
      }
    }

    if (paragraphs.length === 0) {
      // Fallback: split by double line breaks
      const lines = content
        .replace(/<br[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .split(/\n\n+/)
        .filter(line => line.trim().length > 20)
        .slice(0, count);
      
      return lines.join('\n\n');
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Fetch and parse RSS feed from a given URL
   */
  async fetchFeed(url: string): Promise<RSSItem[]> {
    try {
      logger.info(`Fetching RSS feed from: ${url}`);
      const feed = await this.parser.parseURL(url);
      
      if (!feed.items || feed.items.length === 0) {
        logger.warn(`No items found in RSS feed: ${url}`);
        return [];
      }

      logger.info(`Found ${feed.items.length} items in RSS feed: ${url}`);
      return feed.items;
    } catch (error) {
      logger.error(`Error fetching RSS feed from ${url}:`, error);
      throw new Error(`Failed to fetch RSS feed: ${(error as Error).message}`);
    }
  }

  /**
   * Validate if a URL is a valid RSS feed
   */
  async validateRSSFeed(url: string): Promise<boolean> {
    try {
      const feed = await this.parser.parseURL(url);
      return !!(feed && feed.items && feed.items.length > 0);
    } catch (error) {
      logger.error(`Invalid RSS feed ${url}:`, error);
      return false;
    }
  }

  /**
   * Convert RSS item to Article format
   */
  private convertToArticle(item: RSSItem, sourceId: number): Omit<Article, 'id' | 'createdAt' | 'updatedAt'> {
    // Extract content - try different fields
    let content = item['content:encoded'] || item.content || item.summary || '';
    let summary = item.contentSnippet || item['content:encodedSnippet'] || '';
    
    // Sanitize content
    if (content) {
      content = sanitizeHtml(content);
    }

    // Extract image URL
    const imageUrl = this.extractImageUrl(item, content);

    // Generate excerpt (first 2 paragraphs or 300 chars)
    const excerpt = this.extractFirstParagraphs(content) || this.generateExcerpt(content, 1000);

    // Clean up summary - remove HTML and limit length
    if (summary) {
      summary = summary.replace(/<[^>]*>/g, '').trim();
      if (summary.length > 300) {
        summary = summary.substring(0, 297) + '...';
      }
    }

    // Generate description if not provided
    const description = summary || this.generateExcerpt(content, 300);

    // Extract author - try different fields
    const author = item.creator || item.author || item['dc:creator'] || null;

    // Parse date
    let publishedDate: Date | undefined;
    if (item.isoDate) {
      publishedDate = new Date(item.isoDate);
    } else if (item.pubDate) {
      publishedDate = new Date(item.pubDate);
    }

    // Log image extraction for debugging
    if (imageUrl) {
      logger.debug(`Found image for article "${item.title}": ${imageUrl}`);
    }

    return {
      title: item.title || 'Sans titre',
      content: content || undefined,
      summary: summary || undefined,
      description: description || undefined,
      excerpt: excerpt || undefined,
      imageUrl: imageUrl || undefined,
      url: item.link || item.guid || '',
      author: author || undefined,
      publishedDate,
      sourceId,
      isRead: false,
      isFavorite: false,
      isArchived: false
    };
  }

  /**
   * Sync articles from RSS feed for a specific source
   */
  async syncSourceArticles(source: Source): Promise<{ found: number; new: number; errors: string[] }> {
    if (!source.rssUrl) {
      throw new Error('Source does not have an RSS URL');
    }

    const errors: string[] = [];
    let articlesFound = 0;
    let articlesNew = 0;

    try {
      // Fetch RSS items
      const items = await this.fetchFeed(source.rssUrl);
      articlesFound = items.length;

      // Convert to articles and filter out duplicates
      const articles: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      let skippedExisting = 0;
      let skippedNoUrl = 0;
      let imagesFound = 0;
      
      logger.info(`Processing ${items.length} items from RSS feed...`);
      
      for (const item of items) {
        try {
          // Skip if no URL
          if (!item.link && !item.guid) {
            errors.push(`Item without URL: ${item.title}`);
            skippedNoUrl++;
            continue;
          }

          // Check if article already exists
          const existingArticle = articleModel.findByUrl(item.link || item.guid || '');
          if (existingArticle) {
            skippedExisting++;
            continue;
          }

          const article = this.convertToArticle(item, source.id);
          if (article.imageUrl) {
            imagesFound++;
          }
          articles.push(article);
        } catch (error) {
          errors.push(`Error processing item "${item.title}": ${(error as Error).message}`);
        }
      }

      logger.info(`Processed ${items.length} items: ${articles.length} new, ${skippedExisting} already exist, ${skippedNoUrl} without URL, ${imagesFound} with images`);

      // Bulk insert new articles
      if (articles.length > 0) {
        logger.info(`Inserting ${articles.length} new articles...`);
        articlesNew = articleModel.bulkCreate(articles);
        logger.info(`Added ${articlesNew} new articles from source ${source.name}`);
      } else {
        logger.info(`No new articles to add from source ${source.name}`);
      }

      return { found: articlesFound, new: articlesNew, errors };
    } catch (error) {
      logger.error(`Error syncing source ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Test RSS feed and return sample articles
   */
  async testFeed(url: string, limit: number = 5): Promise<Partial<Article>[]> {
    try {
      const items = await this.fetchFeed(url);
      const sampleItems = items.slice(0, limit);
      
      return sampleItems.map(item => {
        const content = item['content:encoded'] || item.content || item.summary || '';
        const imageUrl = this.extractImageUrl(item, content);
        const excerpt = this.extractFirstParagraphs(content) || this.generateExcerpt(content);
        
        return {
          title: item.title || 'Sans titre',
          summary: item.contentSnippet || item.summary || '',
          excerpt: excerpt || undefined,
          imageUrl: imageUrl || undefined,
          url: item.link || item.guid || '',
          author: item.creator || item.author || undefined,
          publishedDate: item.isoDate ? new Date(item.isoDate) : undefined
        };
      });
    } catch (error) {
      logger.error(`Error testing RSS feed ${url}:`, error);
      throw error;
    }
  }

  /**
   * Extract RSS feed URL from a website (basic detection)
   */
  async detectRSSFeed(websiteUrl: string): Promise<string[]> {
    // Common RSS feed patterns
    const commonPatterns = [
      '/rss',
      '/feed',
      '/rss.xml',
      '/feed.xml',
      '/feeds/posts/default',
      '/index.xml',
      '/atom.xml',
      '/?feed=rss2',
      '/?feed=rss',
      '/?feed=atom'
    ];

    const detectedFeeds: string[] = [];
    
    // Ensure URL has protocol
    if (!websiteUrl.startsWith('http')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    // Remove trailing slash
    websiteUrl = websiteUrl.replace(/\/$/, '');

    // Test common patterns
    for (const pattern of commonPatterns) {
      const feedUrl = websiteUrl + pattern;
      try {
        const isValid = await this.validateRSSFeed(feedUrl);
        if (isValid) {
          detectedFeeds.push(feedUrl);
          logger.info(`Detected RSS feed: ${feedUrl}`);
        }
      } catch (error) {
        // Silently continue to next pattern
      }
    }

    return detectedFeeds;
  }
}

// Export singleton instance
export const rssService = new RSSService();