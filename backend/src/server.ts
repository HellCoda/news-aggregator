// backend/src/server.ts
import { logger } from './utils/logger';
import { initializeDatabase, getDatabase } from './config/database';
import { initDatabase, checkTablesExist } from './database/init';
import { runMigrations } from './database/migrate';

const PORT = parseInt(process.env.PORT || '3001', 10);
let server: any; // Déclaré globalement pour la gestion de l'arrêt

const initApp = async () => {
  try {
    // 1. Initialiser la connexion à la base AVANT d'importer app
    logger.info('Connecting to database...');
    initializeDatabase();
    const db = getDatabase();
    logger.info('✅ Database connected successfully');

    // 2. Vérifier si les tables existent, sinon les créer
    if (!checkTablesExist(db)) {
      logger.info('📋 Database tables not found, initializing...');
      initDatabase();
    } else {
      logger.info('✅ Database tables already exist');
    }

    // 3. Exécuter les migrations
    try {
      await runMigrations();
    } catch (migrationError) {
      logger.warn('Migration error (non-fatal):', migrationError);
    }

    // 4. Importer app APRÈS l'initialisation de la DB
    const app = (await import('./app')).default;

    // 5. Démarrer le serveur
    server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ Server running on port ${PORT}`);
  console.log(`✅ Server is listening on http://0.0.0.0:${PORT}`);
  
  // Test que le serveur répond
  setTimeout(() => {
    const http = require('http');
    http.get(`http://localhost:${PORT}/api/health`, (res: import('http').IncomingMessage) => {
      console.log('Health check status:', res.statusCode);
    }).on('error', (err: Error) => {
      console.error('Health check error:', err);
    });
  }, 1000);
});



    // 6. Démarrer le scheduler de synchronisation si disponible
    try {
      const { syncService } = await import('./services/sync.service');
      logger.info('Starting sync scheduler...');
      syncService.startScheduler();
      
      // 7. Lancer une synchronisation initiale au démarrage (si activé)
      const syncOnStartup = process.env.SYNC_ON_STARTUP === 'true';
      const syncStartupDelay = parseInt(process.env.SYNC_STARTUP_DELAY || '5000');
      
      if (syncOnStartup) {
        setTimeout(() => {
          logger.info('🔄 Running initial sync on startup...');
          syncService.syncAllSources().then(() => {
            logger.info('✅ Initial sync completed');
          }).catch(error => {
            logger.warn('Initial sync failed (non-fatal):', error);
          });
        }, syncStartupDelay);
      } else {
        logger.info('Sync on startup is disabled');
      }
    } catch (error) {
      logger.warn('Sync service not available:', error);
    }

  } catch (error) {
    logger.error('Failed to start server:', error);
    // Ne pas faire process.exit(1) dans Electron !
    if (process.env.ELECTRON_RUN_AS_NODE) {
      // On est dans Electron, ne pas tuer le processus
      throw error;
    } else {
      process.exit(1);
    }
  }
};

// Démarrer l'application
initApp();

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Ne pas quitter le processus, juste logger
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Ne pas quitter le processus, juste logger
});