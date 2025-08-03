// C:\Users\Camille\Desktop\news-aggregator\backend\src\middleware\error.middleware.ts
import { errorHandler as enhancedErrorHandler } from '../services/error.service';

// Re-export le gestionnaire d'erreur amélioré depuis le service
export const errorHandler = enhancedErrorHandler;

// Ancien type pour la compatibilité
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}