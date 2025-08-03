import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/logger';

let db: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
  try {
    // Get the database path from env or use default
    let dbPath = process.env.DATABASE_PATH;
    
    if (!dbPath) {
      // En production, utiliser un chemin absolu si fourni par Electron
      if (process.env.NODE_ENV === 'production') {
        dbPath = path.join(process.cwd(), 'database', 'news.db');
      } else {
        dbPath = path.resolve(__dirname, '../../database/news.db');
      }
    }
    
    logger.info(`Connecting to database at: ${dbPath}`);
    
    // Extract directory from the database path
    const dbDir = path.dirname(dbPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      logger.info(`Created database directory: ${dbDir}`);
    }
    
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? logger.debug : undefined
    });
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Optimize for performance
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    
    logger.info('✅ Database connected successfully');
    
    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    logger.info('Database connection closed');
    db = null;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
});

process.on('SIGTERM', () => {
  closeDatabase();
});

console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);
console.log('Module paths:', module.paths);