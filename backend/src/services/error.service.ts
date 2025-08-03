import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Types d'erreurs personnalisées
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(`Database error: ${message}`, 500, false, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`External service error (${service}): ${message}`, 503, true, details);
  }
}

// Gestionnaire d'erreur global amélioré
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log l'erreur
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Si c'est une erreur opérationnelle, on la gère proprement
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  // Si c'est une erreur de validation Express-Validator
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation failed',
      details: err.message,
    });
    return;
  }

  // Si c'est une erreur de syntaxe JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
    });
    return;
  }

  // Si c'est une erreur SQLite
  if (err.message && err.message.includes('SQLITE')) {
    res.status(500).json({
      error: 'Database error occurred',
    });
    return;
  }

  // Erreur inconnue - on ne révèle pas les détails en production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
  });
};

// Wrapper pour les fonctions async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Fonction utilitaire pour créer des messages d'erreur user-friendly
export const getUserFriendlyError = (error: Error): string => {
  // Erreurs réseau
  if (error.message.includes('ECONNREFUSED')) {
    return 'Impossible de se connecter au service. Veuillez réessayer plus tard.';
  }
  if (error.message.includes('ETIMEDOUT')) {
    return 'La requête a pris trop de temps. Veuillez réessayer.';
  }
  if (error.message.includes('ENOTFOUND')) {
    return 'Impossible de trouver le serveur demandé.';
  }
  
  // Erreurs RSS/Scraping
  if (error.message.includes('RSS')) {
    return 'Erreur lors de la lecture du flux RSS. Vérifiez l\'URL.';
  }
  if (error.message.includes('parsing')) {
    return 'Impossible d\'analyser le contenu. Le format peut être invalide.';
  }
  
  // Erreurs de base de données
  if (error.message.includes('UNIQUE constraint')) {
    return 'Cet élément existe déjà.';
  }
  if (error.message.includes('FOREIGN KEY constraint')) {
    return 'Impossible de supprimer cet élément car il est lié à d\'autres données.';
  }
  
  // Erreur par défaut
  return 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
};

// Fonction utilitaire pour sanitizer les entrées HTML
export const sanitizeHtml = (html: string): string => {
  // Enlever les scripts et tags dangereux côté serveur
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+\s*=\s*'[^']*'/gi, '');
};