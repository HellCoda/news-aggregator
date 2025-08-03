import { getDatabase } from '../config/database';
// Import types from shared instead of individual model files
import { Article, Source, Category } from '../types';

export interface SavedArticle {
  id?: number;
  original_article_id?: number;
  title: string;
  content?: string;
  summary?: string;
  url: string;
  author?: string;
  published_date?: Date;
  source_name: string;
  source_url?: string;
  category_name?: string;
  category_id?: number;
  saved_at?: Date;
  notes?: string;
  tags?: string[];
  created_at?: Date;
  updated_at?: Date;
}

export class SavedArticleModel {
  /**
   * Save an article permanently
   */
  static async saveArticle(articleId: number, notes?: string, tags?: string[]): Promise<SavedArticle> {
    const db = getDatabase();
    
    // First, get the article with its source and category info
    const article = db.prepare(`
      SELECT 
        a.*,
        s.name as source_name,
        s.url as source_url,
        c.name as category_name,
        c.id as category_id
      FROM articles a
      JOIN sources s ON a.source_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE a.id = ?
    `).get(articleId) as any;

    if (!article) {
      throw new Error('Article not found');
    }

    // Check if already saved
    const existing = db.prepare(`
      SELECT id FROM saved_articles WHERE original_article_id = ?
    `).get(articleId) as any;

    if (existing) {
      throw new Error('Article already saved');
    }

    // Insert into saved_articles
    const result = db.prepare(`
      INSERT INTO saved_articles (
        original_article_id,
        title,
        content,
        summary,
        url,
        author,
        published_date,
        source_name,
        source_url,
        category_name,
        category_id,
        notes,
        tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      articleId,
      article.title,
      article.content,
      article.summary,
      article.url,
      article.author,
      article.published_date,
      article.source_name,
      article.source_url,
      article.category_name,
      article.category_id,
      notes,
      tags ? JSON.stringify(tags) : null
    );

    const savedArticle = await this.getById(result.lastInsertRowid as number);
    if (!savedArticle) {
      throw new Error('Failed to retrieve saved article');
    }
    return savedArticle;
  }

  /**
   * Get all saved articles
   */
  static async getAll(options?: {
    limit?: number;
    offset?: number;
    category_id?: number;
    search?: string;
  }): Promise<{ articles: SavedArticle[]; total: number }> {
    const db = getDatabase();
    let query = 'SELECT * FROM saved_articles WHERE 1=1';
    const params: any[] = [];

    if (options?.category_id) {
      query += ' AND category_id = ?';
      params.push(options.category_id);
    }

    if (options?.search) {
      query += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)';
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const total = (db.prepare(countQuery).get(...params) as any).count;

    // Add ordering and pagination
    query += ' ORDER BY saved_at DESC';
    
    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const articles = db.prepare(query).all(...params) as SavedArticle[];

    // Parse tags JSON
    articles.forEach(article => {
      if (article.tags && typeof article.tags === 'string') {
        try {
          article.tags = JSON.parse(article.tags);
        } catch {
          article.tags = [];
        }
      }
    });

    return { articles, total };
  }

  /**
   * Get a saved article by ID
   */
  static async getById(id: number): Promise<SavedArticle | null> {
    const db = getDatabase();
    const article = db.prepare(`
      SELECT * FROM saved_articles WHERE id = ?
    `).get(id) as SavedArticle;

    if (article && article.tags && typeof article.tags === 'string') {
      try {
        article.tags = JSON.parse(article.tags);
      } catch {
        article.tags = [];
      }
    }

    return article || null;
  }

  /**
   * Update notes or tags for a saved article
   */
  static async update(id: number, updates: { notes?: string; tags?: string[] }): Promise<SavedArticle> {
    const db = getDatabase();
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.notes !== undefined) {
      updateFields.push('notes = ?');
      params.push(updates.notes);
    }

    if (updates.tags !== undefined) {
      updateFields.push('tags = ?');
      params.push(JSON.stringify(updates.tags));
    }

    if (updateFields.length === 0) {
      const article = await this.getById(id);
      if (!article) {
        throw new Error('Saved article not found');
      }
      return article;
    }

    params.push(id);
    
    db.prepare(`
      UPDATE saved_articles 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `).run(...params);

    const updatedArticle = await this.getById(id);
    if (!updatedArticle) {
      throw new Error('Failed to retrieve updated article');
    }
    return updatedArticle;
  }

  /**
   * Delete a saved article
   */
  static async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = db.prepare(`
      DELETE FROM saved_articles WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }

  /**
   * Check if an article is saved
   */
  static async isSaved(articleId: number): Promise<boolean> {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM saved_articles WHERE original_article_id = ?
    `).get(articleId) as any;

    return result.count > 0;
  }

  /**
   * Get saved article by original article ID
   */
  static async getByOriginalId(articleId: number): Promise<SavedArticle | null> {
    const db = getDatabase();
    const article = db.prepare(`
      SELECT * FROM saved_articles WHERE original_article_id = ?
    `).get(articleId) as SavedArticle;

    if (article && article.tags && typeof article.tags === 'string') {
      try {
        article.tags = JSON.parse(article.tags);
      } catch {
        article.tags = [];
      }
    }

    return article || null;
  }
}

// Export singleton instance
export const savedArticleModel = new SavedArticleModel();
