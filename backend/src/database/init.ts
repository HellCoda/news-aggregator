// backend/src/database/init.ts
import { Database } from 'better-sqlite3';
import { getDatabase } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

export const initDatabase = () => {
  try {
    const db = getDatabase();
    
    // Lire le fichier schema.sql
    let schemaPath: string;
    if (process.env.NODE_ENV === 'production' && process.env.SCHEMA_PATH) {
      schemaPath = process.env.SCHEMA_PATH;
    } else {
      schemaPath = join(__dirname, 'schema.sql');
    }
    
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Exécuter le schema
    logger.info('Creating database tables...');
    db.exec(schema);
    
    // Exécuter seulement les INSERT de user_preferences (pas les sources)
    logger.info('Inserting default preferences...');
    db.exec(`
      INSERT OR IGNORE INTO user_preferences (key, value) VALUES 
        ('theme', 'light'),
        ('articles_per_page', '20'),
        ('auto_mark_read', 'false'),
        ('notification_enabled', 'true'),
        ('sync_interval', '30'),
        ('language', 'fr'),
        ('compact_view', 'false'),
        ('show_images', 'true');
    `);
    
    logger.info('Database initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
};

// Vérifier si les tables existent
export const checkTablesExist = (db: Database): boolean => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('categories', 'sources', 'articles')
    `).all();
    
    return tables.length >= 3; // On attend au moins 3 tables principales
  } catch (error) {
    return false;
  }
};