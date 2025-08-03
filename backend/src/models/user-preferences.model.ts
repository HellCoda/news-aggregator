// backend/src/models/user-preferences.model.ts
import { Database } from 'better-sqlite3';
import { getDatabase } from '../config/database';
import { DatabaseError } from '../services/error.service';

export class UserPreferencesModel {
  private db!: Database;

  constructor() {
    // Database will be initialized lazily
  }

  private getDb(): Database {
    if (!this.db) {
      this.db = getDatabase();
    }
    return this.db;
  }

  /**
   * Get a preference value by key
   */
  get(key: string): string | null {
    try {
      const stmt = this.getDb().prepare('SELECT value FROM user_preferences WHERE key = ?');
      const row = stmt.get(key) as { value: string } | undefined;
      return row ? row.value : null;
    } catch (error) {
      throw new DatabaseError('Failed to get preference', error);
    }
  }

  /**
   * Set a preference value
   */
  set(key: string, value: string): void {
    try {
      const stmt = this.getDb().prepare(`
        INSERT INTO user_preferences (key, value) 
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(key, value);
    } catch (error) {
      throw new DatabaseError('Failed to set preference', error);
    }
  }

  /**
   * Get all preferences
   */
  getAll(): Record<string, string> {
    try {
      const stmt = this.getDb().prepare('SELECT key, value FROM user_preferences');
      const rows = stmt.all() as { key: string; value: string }[];
      
      const preferences: Record<string, string> = {};
      for (const row of rows) {
        preferences[row.key] = row.value;
      }
      
      return preferences;
    } catch (error) {
      throw new DatabaseError('Failed to get all preferences', error);
    }
  }

  /**
   * Delete a preference
   */
  delete(key: string): boolean {
    try {
      const stmt = this.getDb().prepare('DELETE FROM user_preferences WHERE key = ?');
      const info = stmt.run(key);
      return info.changes > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete preference', error);
    }
  }

  /**
   * Clear all preferences
   */
  clear(): void {
    try {
      const stmt = this.getDb().prepare('DELETE FROM user_preferences');
      stmt.run();
    } catch (error) {
      throw new DatabaseError('Failed to clear preferences', error);
    }
  }
}

// Export singleton instance
export const userPreferencesModel = new UserPreferencesModel();
