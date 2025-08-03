import { initializeDatabase, getDatabase } from '../config/database';

// Script pour marquer la migration 001 comme déjà exécutée
try {
  console.log('🔧 Fixing migration history...');
  
  // Initialize database
  initializeDatabase();
  const db = getDatabase();
  
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Mark migration 001 as already executed
  try {
    db.prepare('INSERT INTO migrations (filename) VALUES (?)').run('001_add_image_excerpt.sql');
    console.log('✅ Marked migration 001_add_image_excerpt.sql as executed');
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('ℹ️  Migration 001_add_image_excerpt.sql already marked as executed');
    } else {
      throw error;
    }
  }
  
  // Check if migration 002 exists
  const migration002 = db.prepare('SELECT * FROM migrations WHERE filename = ?').get('002_add_saved_articles.sql');
  if (!migration002) {
    console.log('📋 Migration 002_add_saved_articles.sql not yet executed');
    console.log('   Run "npm run db:migrate" to apply it');
  } else {
    console.log('✅ Migration 002_add_saved_articles.sql already executed');
  }
  
  console.log('\n✅ Migration history fixed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to fix migration history:', error);
  process.exit(1);
}
