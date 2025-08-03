// backend/src/database/migrate.ts
import { Database } from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export function runMigrations(database?: Database) {
  const db = database || getDatabase();
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get list of migration files
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  // Get already executed migrations
  const executedMigrations = db.prepare('SELECT filename FROM migrations').all() as { filename: string }[];
  const executedFilenames = new Set(executedMigrations.map(m => m.filename));

  // Run pending migrations
  for (const file of migrationFiles) {
    if (!executedFilenames.has(file)) {
      logger.info(`Running migration: ${file}`);
      
      try {
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec(migrationSQL);
        
        // Record migration as executed
        db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(file);
        
        logger.info(`Migration ${file} completed successfully`);
      } catch (error) {
        logger.error(`Migration ${file} failed:`, error);
        throw error;
      }
    }
  }
  
  logger.info('All migrations completed');
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}