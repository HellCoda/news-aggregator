// backend/src/models/article.model.ts
import { Database } from 'better-sqlite3';
import { getDatabase } from '../config/database';
import { Article, PaginatedResponse, ArticleFilters } from '../types';
import { DatabaseError } from '../services/error.service';
import { toISOString, toDate } from '../utils/date-helpers';

export class ArticleModel {
  private db!: Database;

  constructor() {
    //this.db = getDatabase();
  }

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase();
    }
    return this.db;
  }

  // Create a new article
  create(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Article {
    try {
      const stmt = this.getDb().prepare(`
        INSERT INTO articles (
          title, content, summary, description, excerpt, image_url, url, author, published_date, 
          source_id, is_read, is_favorite, is_archived
        ) VALUES (
          @title, @content, @summary, @description, @excerpt, @imageUrl, @url, @author, @publishedDate, 
          @sourceId, @isRead, @isFavorite, @isArchived
        )
      `);

      const info = stmt.run({
        title: article.title,
        content: article.content || null,
        summary: article.summary || null,
        description: article.description || null,
        excerpt: article.excerpt || null,
        imageUrl: article.imageUrl || null,
        url: article.url,
        author: article.author || null,
        publishedDate: toISOString(article.publishedDate),
        sourceId: article.sourceId,
        isRead: article.isRead ? 1 : 0,
        isFavorite: article.isFavorite ? 1 : 0,
        isArchived: article.isArchived ? 1 : 0  // Toujours 0 (false) par défaut
      });

      return this.findById(Number(info.lastInsertRowid))!;
    } catch (error) {
      throw new DatabaseError('Failed to create article', error);
    }
  }

  // Find article by ID
  findById(id: number): Article | null {
    try {
      const stmt = this.getDb().prepare(`
        SELECT 
          a.*, 
          s.name as source_name, 
          s.url as source_url,
          s.category_id,
          c.name as category_name,
          c.color as category_color
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE a.id = ?
      `);

      const row = stmt.get(id);
      return row ? this.mapRowToArticle(row) : null;
    } catch (error) {
      throw new DatabaseError('Failed to find article by ID', error);
    }
  }

  // Find article by URL
  findByUrl(url: string): Article | null {
    try {
      const stmt = this.getDb().prepare(`
        SELECT 
          a.*, 
          s.name as source_name, 
          s.url as source_url,
          s.category_id,
          c.name as category_name,
          c.color as category_color
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE a.url = ?
      `);

      const row = stmt.get(url);
      return row ? this.mapRowToArticle(row) : null;
    } catch (error) {
      throw new DatabaseError('Failed to find article by URL', error);
    }
  }

  // Find all articles with pagination and filters
  findAll(options: ArticleFilters & { page?: number; limit?: number } = {}): PaginatedResponse<Article> {
    try {
      const { 
        page = 1, 
        limit = 20,
        sourceId,
        categoryId,
        isRead,
        isFavorite,
        search,
        startDate,
        endDate
      } = options;

      const offset = (page - 1) * limit;
      
      // Build WHERE clause
      const conditions: string[] = [];
      const params: any = {};

      // Gestion spéciale pour les archives et favoris
      if (isFavorite === true) {
        // Pour les favoris, on ne filtre pas les archivés
        conditions.push('a.is_favorite = 1');
      } else if (options.isArchived === true) {
        // Pour la page archives, on veut seulement les archivés
        conditions.push('a.is_archived = 1');
      } else {
        // Pour la vue normale, exclure les archivés
        conditions.push('a.is_archived = 0');
      }

      if (sourceId !== undefined) {
        conditions.push('a.source_id = @sourceId');
        params.sourceId = sourceId;
      }

      if (categoryId !== undefined) {
        conditions.push('s.category_id = @categoryId');
        params.categoryId = categoryId;
      }

      if (isRead !== undefined) {
        conditions.push('a.is_read = @isRead');
        params.isRead = isRead ? 1 : 0;
      }

      if (isFavorite !== undefined) {
        conditions.push('a.is_favorite = @isFavorite');
        params.isFavorite = isFavorite ? 1 : 0;
      }

      if (search) {
        conditions.push('(a.title LIKE @search OR a.summary LIKE @search OR a.excerpt LIKE @search)');
        params.search = `%${search}%`;
      }

      if (startDate) {
        conditions.push('a.published_date >= @startDate');
        params.startDate = typeof startDate === 'string' ? startDate : startDate.toISOString();
      }

      if (endDate) {
        conditions.push('a.published_date <= @endDate');
        params.endDate = typeof endDate === 'string' ? endDate : endDate.toISOString();
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total
      const countStmt = this.getDb().prepare(`
        SELECT COUNT(*) as total 
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        ${whereClause}
      `);
      
      const { total } = countStmt.get(params) as { total: number };

      // Get paginated results
      const stmt = this.getDb().prepare(`
        SELECT 
          a.*, 
          s.name as source_name, 
          s.url as source_url,
          s.category_id,
          c.name as category_name,
          c.color as category_color
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        LEFT JOIN categories c ON s.category_id = c.id
        ${whereClause}
        ORDER BY a.published_date DESC, a.created_at DESC
        LIMIT @limit OFFSET @offset
      `);

      const rows = stmt.all({ ...params, limit, offset });
      const articles = rows.map(row => this.mapRowToArticle(row));

      return {
        data: articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Failed to find articles', error);
    }
  }

  // Update article status (read, favorite, archived)
  update(id: number, updates: Partial<Article>): Article | null {
    try {
      const setClauses: string[] = [];
      const params: any = { id };

      if ('isRead' in updates) {
        setClauses.push('is_read = @isRead');
        params.isRead = updates.isRead ? 1 : 0;
        if (updates.isRead) {
          setClauses.push('read_at = CURRENT_TIMESTAMP');
        }
      }

      if ('isFavorite' in updates) {
        setClauses.push('is_favorite = @isFavorite');
        params.isFavorite = updates.isFavorite ? 1 : 0;
        if (updates.isFavorite) {
          setClauses.push('favorited_at = CURRENT_TIMESTAMP');
        }
      }

      if ('isArchived' in updates) {
        setClauses.push('is_archived = @isArchived');
        params.isArchived = updates.isArchived ? 1 : 0;
      }

      if (setClauses.length === 0) {
        return this.findById(id);
      }

      const stmt = this.getDb().prepare(`
        UPDATE articles 
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);

      stmt.run(params);
      return this.findById(id);
    } catch (error) {
      throw new DatabaseError('Failed to update article', error);
    }
  }

  // Delete article
  delete(id: number): boolean {
    try {
      const stmt = this.getDb().prepare('DELETE FROM articles WHERE id = ?');
      const info = stmt.run(id);
      return info.changes > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete article', error);
    }
  }

  // Delete multiple articles
  deleteMany(ids: number[]): number {
    try {
      if (ids.length === 0) return 0;
      
      const placeholders = ids.map(() => '?').join(',');
      const stmt = this.getDb().prepare(`DELETE FROM articles WHERE id IN (${placeholders})`);
      const info = stmt.run(...ids);
      return info.changes;
    } catch (error) {
      throw new DatabaseError('Failed to delete multiple articles', error);
    }
  }

  // Delete all articles (with optional filters)
  deleteAll(filters?: { sourceId?: number; categoryId?: number; isRead?: boolean }): number {
    try {
      let query = 'DELETE FROM articles WHERE 1=1';
      const params: any[] = [];

      if (filters?.sourceId) {
        query += ' AND source_id = ?';
        params.push(filters.sourceId);
      }

      if (filters?.categoryId) {
        // Pour filtrer par catégorie, nous devons joindre la table sources
        query = `DELETE FROM articles WHERE id IN (
          SELECT a.id FROM articles a
          JOIN sources s ON a.source_id = s.id
          WHERE 1=1`;
        
        if (filters.sourceId) {
          query += ' AND a.source_id = ?';
        }
        
        query += ' AND s.category_id = ?';
        params.push(filters.categoryId);
        
        if (filters.isRead !== undefined) {
          query += ' AND a.is_read = ?';
          params.push(filters.isRead ? 1 : 0);
        }
        
        query += ')';
      } else if (filters?.isRead !== undefined) {
        query += ' AND is_read = ?';
        params.push(filters.isRead ? 1 : 0);
      }

      const stmt = this.getDb().prepare(query);
      const info = stmt.run(...params);
      return info.changes;
    } catch (error) {
      throw new DatabaseError('Failed to delete all articles', error);
    }
  }

  // Delete old articles (older than specified days)
  deleteOldArticles(daysOld: number = 15): number {
    try {
      const stmt = this.getDb().prepare(`
        DELETE FROM articles 
        WHERE created_at < datetime('now', '-' || ? || ' days')
        AND is_favorite = 0
      `);
      const info = stmt.run(daysOld);
      return info.changes;
    } catch (error) {
      throw new DatabaseError('Failed to delete old articles', error);
    }
  }

  // Bulk create articles
  bulkCreate(articles: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>[]): number {
    try {
      const stmt = this.getDb().prepare(`
        INSERT INTO articles (
          title, content, summary, description, excerpt, image_url, url, author, published_date,
          source_id, is_read, is_favorite, is_archived
        ) VALUES (
          @title, @content, @summary, @description, @excerpt, @imageUrl, @url, @author, @publishedDate,
          @sourceId, @isRead, @isFavorite, @isArchived
        )
      `);

      const insertMany = this.getDb().transaction((articles) => {
        let inserted = 0;
        for (const article of articles) {
          try {
            stmt.run({
              title: article.title,
              content: article.content || null,
              summary: article.summary || null,
              description: article.description || null,
              excerpt: article.excerpt || null,
              imageUrl: article.imageUrl || null,
              url: article.url,
              author: article.author || null,
              publishedDate: toISOString(article.publishedDate),
              sourceId: article.sourceId,
              isRead: article.isRead || false ? 1 : 0,
              isFavorite: article.isFavorite || false ? 1 : 0,
              isArchived: 0  // TOUJOURS 0 pour les nouveaux articles
            });
            inserted++;
          } catch (error) {
            // Skip duplicates (UNIQUE constraint on URL)
            if (!(error as Error).message.includes('UNIQUE constraint')) {
              throw error;
            }
          }
        }
        return inserted;
      });

      return insertMany(articles);
    } catch (error) {
      throw new DatabaseError('Failed to bulk create articles', error);
    }
  }

  // Update article content (for sync updates)
  updateContent(id: number, updates: Partial<Article>): Article | null {
    try {
      const setClauses: string[] = [];
      const params: any = { id };

      if ('title' in updates) {
        setClauses.push('title = @title');
        params.title = updates.title;
      }

      if ('content' in updates) {
        setClauses.push('content = @content');
        params.content = updates.content || null;
      }

      if ('summary' in updates) {
        setClauses.push('summary = @summary');
        params.summary = updates.summary || null;
      }

      if ('description' in updates) {
        setClauses.push('description = @description');
        params.description = updates.description || null;
      }

      if ('excerpt' in updates) {
        setClauses.push('excerpt = @excerpt');
        params.excerpt = updates.excerpt || null;
      }

      if ('imageUrl' in updates) {
        setClauses.push('image_url = @imageUrl');
        params.imageUrl = updates.imageUrl || null;
      }

      if ('publishedDate' in updates) {
        setClauses.push('published_date = @publishedDate');
        params.publishedDate = toISOString(updates.publishedDate);
      }

      if (setClauses.length === 0) {
        return this.findById(id);
      }

      const stmt = this.getDb().prepare(`
        UPDATE articles 
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `);

      stmt.run(params);
      return this.findById(id);
    } catch (error) {
      throw new DatabaseError('Failed to update article content', error);
    }
  }

  // Find duplicate articles by URL
  findDuplicatesByUrl(sourceId?: number): Article[][] {
    try {
      let query = `
        SELECT url, COUNT(*) as count
        FROM articles
        WHERE 1=1
      `;
      const params: any[] = [];

      if (sourceId) {
        query += ' AND source_id = ?';
        params.push(sourceId);
      }

      query += ' GROUP BY url HAVING count > 1';

      const duplicateUrls = this.getDb().prepare(query).all(...params) as { url: string }[];
      const duplicateGroups: Article[][] = [];

      for (const { url } of duplicateUrls) {
        const stmt = this.getDb().prepare(`
          SELECT 
            a.*, 
            s.name as source_name, 
            s.url as source_url,
            s.category_id,
            c.name as category_name,
            c.color as category_color
          FROM articles a
          LEFT JOIN sources s ON a.source_id = s.id
          LEFT JOIN categories c ON s.category_id = c.id
          WHERE a.url = ?
          ORDER BY a.created_at DESC
        `);

        const articles = stmt.all(url).map(row => this.mapRowToArticle(row));
        if (articles.length > 1) {
          duplicateGroups.push(articles);
        }
      }

      return duplicateGroups;
    } catch (error) {
      throw new DatabaseError('Failed to find duplicate articles', error);
    }
  }

  // Get article statistics
  getStats(): { total: number; unread: number; favorites: number; sources: number } {
    try {
      const stats = this.getDb().prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_read = 0 AND is_archived = 0 THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorites,
          COUNT(DISTINCT source_id) as sources
        FROM articles
        WHERE is_archived = 0
      `).get() as any;

      return {
        total: stats.total || 0,
        unread: stats.unread || 0,
        favorites: stats.favorites || 0,
        sources: stats.sources || 0
      };
    } catch (error) {
      throw new DatabaseError('Failed to get article stats', error);
    }
  }

  // Helper method to map database row to Article object
  private mapRowToArticle(row: any): Article {
    return {
      id: row.id,
      title: row.title,
      content: row.content || undefined,
      summary: row.summary || undefined,
      description: row.description || undefined,
      excerpt: row.excerpt || undefined,
      imageUrl: row.image_url || undefined,
      url: row.url,
      author: row.author || undefined,
      publishedDate: toDate(row.published_date),
      sourceId: row.source_id,
      source: row.source_name ? {
      id: row.source_id,
      name: row.source_name,
      url: row.source_url,
      categoryId: row.category_id,
      category: row.category_name ? {
      id: row.category_id,
      name: row.category_name,
      color: row.category_color
       } as any : undefined
      } as any : undefined,
      isRead: Boolean(row.is_read),
      isFavorite: Boolean(row.is_favorite),
      isArchived: Boolean(row.is_archived),
      readAt: row.read_at ? new Date(row.read_at) : undefined,
      favoritedAt: row.favorited_at ? new Date(row.favorited_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}

// Export singleton instance
export const articleModel = new ArticleModel();