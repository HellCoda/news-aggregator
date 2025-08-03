// backend/src/models/category.model.ts
import { Database } from 'better-sqlite3';
import { getDatabase } from '../config/database';
import { Category } from '../types';

export class CategoryModel {
  private db!: Database;

  constructor() {
    // Ne pas initialiser ici
  }

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase();
    }
    return this.db;
  }

  // Get all categories
  findAll(): Category[] {
    const stmt = this.getDb().prepare(`
      SELECT * FROM categories
      ORDER BY name
    `);

    const rows = stmt.all();
    return rows.map(row => this.mapRowToCategory(row));
  }

  // Find category by ID
  findById(id: number): Category | null {
    const stmt = this.getDb().prepare('SELECT * FROM categories WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapRowToCategory(row) : null;
  }

  // Create a new category
  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const stmt = this.getDb().prepare(`
      INSERT INTO categories (name, color, icon)
      VALUES (@name, @color, @icon)
    `);

    const info = stmt.run({
      name: category.name,
      color: category.color,
      icon: category.icon || null
    });

    return this.findById(Number(info.lastInsertRowid))!;
  }

  // Update category
  update(id: number, updates: Partial<Category>): Category | null {
    const allowedUpdates = ['name', 'color', 'icon'];
    const updateFields: string[] = [];
    const params: any = { id };

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = @${key}`);
        params[key] = value ?? null;
      }
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    const stmt = this.getDb().prepare(`
      UPDATE categories 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `);

    stmt.run(params);
    return this.findById(id);
  }

  // Delete category
  delete(id: number): boolean {
    const stmt = this.getDb().prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get article count per category
  getCategoriesWithCount(): Array<Category & { articleCount: number }> {
    const stmt = this.getDb().prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT a.id) as article_count
      FROM categories c
      LEFT JOIN sources s ON s.category_id = c.id
      LEFT JOIN articles a ON a.source_id = s.id
      GROUP BY c.id
      ORDER BY c.name
    `);

    const rows = stmt.all() as Array<any & { article_count: number }>;
    return rows.map(row => ({
      ...this.mapRowToCategory(row),
      articleCount: row.article_count
    }));
  }

  // Helper method to map database row to Category object
  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}

// Export singleton instance
export const categoryModel = new CategoryModel();