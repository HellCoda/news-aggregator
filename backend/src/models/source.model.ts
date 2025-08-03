// backend/src/models/source.model.ts
import { Database } from 'better-sqlite3';
import { getDatabase } from '../config/database';
import { Source, CreateSourceRequest } from '../types';

export class SourceModel {
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

  // Create a new source
  create(source: CreateSourceRequest): Source {
    const stmt = this.getDb().prepare(`
      INSERT INTO sources (name, url, rss_url, category_id, is_active, sync_frequency)
      VALUES (@name, @url, @rssUrl, @categoryId, @isActive, @syncFrequency)
    `);

    const info = stmt.run({
      name: source.name,
      url: source.url,
      rssUrl: source.rssUrl || null,
      categoryId: source.categoryId || null,
      isActive: 1,  // Always active by default
      syncFrequency: source.syncFrequency || 30
    });

    return this.findById(Number(info.lastInsertRowid))!;
  }

  // Find source by ID
  findAll(activeOnly: boolean = false): Source[] {
    const query = activeOnly 
      ? 'SELECT * FROM sources WHERE is_active = 1 ORDER BY name'
      : 'SELECT * FROM sources ORDER BY name';
    
    const stmt = this.getDb().prepare(query);
    const rows = stmt.all();
    
    return rows.map(row => this.mapRowToSource(row));
  }

  // Find source by ID
  findById(id: number): Source | null {
    const stmt = this.getDb().prepare('SELECT * FROM sources WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapRowToSource(row) : null;
  }

  // Find source by URL
  findByUrl(url: string): Source | null {
    const stmt = this.getDb().prepare('SELECT * FROM sources WHERE url = ? OR rss_url = ?');
    const row = stmt.get(url, url);
    return row ? this.mapRowToSource(row) : null;
  }

  // Update source
  update(id: number, updates: Partial<Source>): Source | null {
    const allowedUpdates = ['name', 'url', 'rssUrl', 'categoryId', 'isActive', 'syncFrequency', 'lastSync', 'lastError'];
    const updateFields: string[] = [];
    const params: any = { id };

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbKey} = @${key}`);
        
        if (key === 'isActive') {
          params[key] = value ? 1 : 0;
        } else if (key === 'lastSync' && value instanceof Date) {
          params[key] = value.toISOString();
        } else {
          params[key] = value ?? null;
        }
      }
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    const stmt = this.getDb().prepare(`
      UPDATE sources 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `);

    stmt.run(params);
    return this.findById(id);
  }

  // Delete source
   delete(id: number): boolean {
    const stmt = this.getDb().prepare('DELETE FROM sources WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Update last sync time
  updateLastSync(id: number, error?: string): void {
    const stmt = this.getDb().prepare(`
      UPDATE sources 
      SET last_sync = CURRENT_TIMESTAMP, last_error = @error
      WHERE id = @id
    `);
    
    stmt.run({ id, error: error || null });
  }

  // Get sources needing sync
  getSourcesNeedingSync(): Source[] {
    const stmt = this.getDb().prepare(`
      SELECT 
        s.*,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color
      FROM sources s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.is_active = 1
        AND (
          s.last_sync IS NULL 
          OR datetime(s.last_sync, '+' || s.sync_frequency || ' minutes') <= datetime('now')
        )
      ORDER BY s.last_sync ASC
    `);

    const rows = stmt.all();
    return rows.map(row => this.mapRowToSource(row));
  }

  // Helper method to map database row to Source object
  private mapRowToSource(row: any): Source {
    return {
      id: row.id,
      name: row.name,
      url: row.url,
      rssUrl: row.rss_url,
      scraperConfig: row.scraper_config ? JSON.parse(row.scraper_config) : undefined,
      categoryId: row.category_id,
      category: row.category_name ? {
        id: row.category_id,
        name: row.category_name,
        color: row.category_color,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined,
      isActive: Boolean(row.is_active),
      syncFrequency: row.sync_frequency,
      lastSync: row.last_sync ? new Date(row.last_sync) : undefined,
      lastError: row.last_error,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}

// Export singleton instance
export const sourceModel = new SourceModel();
