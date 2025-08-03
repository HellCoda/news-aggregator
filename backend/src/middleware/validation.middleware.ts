// backend/src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';

// Types pour les erreurs de validation
interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Fonction utilitaire pour valider une URL
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Fonction utilitaire pour valider un email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction utilitaire pour valider une couleur hexadécimale
const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#[0-9A-F]{6}$/i;
  return hexColorRegex.test(color);
};

// Middleware générique pour gérer les erreurs de validation
export const handleValidationErrors = (errors: ValidationError[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    next();
  };
};

// Validation simple pour les sources
export const validateCreateSource = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { name, url, rssUrl, categoryId, syncFrequency } = req.body;

  // Validation du nom
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Le nom est obligatoire' });
  } else if (name.trim().length < 2 || name.trim().length > 200) {
    errors.push({ field: 'name', message: 'Le nom doit faire entre 2 et 200 caractères', value: name });
  }

  // Validation de l'URL
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    errors.push({ field: 'url', message: 'L\'URL est obligatoire' });
  } else if (!isValidUrl(url.trim())) {
    errors.push({ field: 'url', message: 'URL invalide', value: url });
  }

  // Validation de l'URL RSS (optionnelle)
  if (rssUrl && !isValidUrl(rssUrl.trim())) {
    errors.push({ field: 'rssUrl', message: 'URL RSS invalide', value: rssUrl });
  }

  // Validation de categoryId (optionnel)
  if (categoryId !== undefined && categoryId !== null) {
    const catId = parseInt(categoryId);
    if (isNaN(catId) || catId < 1) {
      errors.push({ field: 'categoryId', message: 'ID de catégorie invalide', value: categoryId });
    }
  }

  // Validation de syncFrequency (optionnel)
  if (syncFrequency !== undefined) {
    const freq = parseInt(syncFrequency);
    if (isNaN(freq) || freq < 5 || freq > 1440) {
      errors.push({ field: 'syncFrequency', message: 'La fréquence doit être entre 5 et 1440 minutes', value: syncFrequency });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
};

// Validation pour mise à jour de source
export const validateUpdateSource = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { id } = req.params;
  const { name, url, rssUrl, categoryId, isActive, syncFrequency } = req.body;

  // Validation de l'ID
  const sourceId = parseInt(id);
  if (isNaN(sourceId) || sourceId < 1) {
    errors.push({ field: 'id', message: 'ID invalide', value: id });
  }

  // Validations optionnelles
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 200) {
      errors.push({ field: 'name', message: 'Le nom doit faire entre 2 et 200 caractères', value: name });
    }
  }

  if (url !== undefined && !isValidUrl(url.trim())) {
    errors.push({ field: 'url', message: 'URL invalide', value: url });
  }

  if (rssUrl !== undefined && rssUrl !== null && !isValidUrl(rssUrl.trim())) {
    errors.push({ field: 'rssUrl', message: 'URL RSS invalide', value: rssUrl });
  }

  if (categoryId !== undefined && categoryId !== null) {
    const catId = parseInt(categoryId);
    if (isNaN(catId) || catId < 1) {
      errors.push({ field: 'categoryId', message: 'ID de catégorie invalide', value: categoryId });
    }
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive doit être un booléen', value: isActive });
  }

  if (syncFrequency !== undefined) {
    const freq = parseInt(syncFrequency);
    if (isNaN(freq) || freq < 5 || freq > 1440) {
      errors.push({ field: 'syncFrequency', message: 'La fréquence doit être entre 5 et 1440 minutes', value: syncFrequency });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
};

// Validation pour mise à jour d'article
export const validateUpdateArticle = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { id } = req.params;
  const { isRead, isFavorite, isArchived } = req.body;

  // Validation de l'ID
  const articleId = parseInt(id);
  if (isNaN(articleId) || articleId < 1) {
    errors.push({ field: 'id', message: 'ID invalide', value: id });
  }

  // Validations des booléens
  if (isRead !== undefined && typeof isRead !== 'boolean') {
    errors.push({ field: 'isRead', message: 'isRead doit être un booléen', value: isRead });
  }

  if (isFavorite !== undefined && typeof isFavorite !== 'boolean') {
    errors.push({ field: 'isFavorite', message: 'isFavorite doit être un booléen', value: isFavorite });
  }

  if (isArchived !== undefined && typeof isArchived !== 'boolean') {
    errors.push({ field: 'isArchived', message: 'isArchived doit être un booléen', value: isArchived });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
};

// Validation pour la pagination
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { page, limit, sourceId, categoryId, isRead, isFavorite, search } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push({ field: 'page', message: 'Le numéro de page doit être supérieur à 0', value: page });
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push({ field: 'limit', message: 'La limite doit être entre 1 et 100', value: limit });
    }
  }

  if (sourceId !== undefined) {
    const srcId = parseInt(sourceId as string);
    if (isNaN(srcId) || srcId < 1) {
      errors.push({ field: 'sourceId', message: 'ID de source invalide', value: sourceId });
    }
  }

  if (categoryId !== undefined) {
    const catId = parseInt(categoryId as string);
    if (isNaN(catId) || catId < 1) {
      errors.push({ field: 'categoryId', message: 'ID de catégorie invalide', value: categoryId });
    }
  }

  if (isRead !== undefined && !['true', 'false'].includes(isRead as string)) {
    errors.push({ field: 'isRead', message: 'isRead doit être true ou false', value: isRead });
  }

  if (isFavorite !== undefined && !['true', 'false'].includes(isFavorite as string)) {
    errors.push({ field: 'isFavorite', message: 'isFavorite doit être true ou false', value: isFavorite });
  }

  if (search !== undefined && (typeof search !== 'string' || search.length > 100)) {
    errors.push({ field: 'search', message: 'La recherche ne peut pas dépasser 100 caractères', value: search });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
};

// Validation pour créer une catégorie
export const validateCreateCategory = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { name, color, icon } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Le nom est obligatoire' });
  } else if (name.trim().length < 2 || name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Le nom doit faire entre 2 et 100 caractères', value: name });
  }

  if (!color || typeof color !== 'string' || !isValidHexColor(color.trim())) {
    errors.push({ field: 'color', message: 'La couleur doit être au format hexadécimal (#RRGGBB)', value: color });
  }

  if (icon !== undefined && (typeof icon !== 'string' || icon.length > 50)) {
    errors.push({ field: 'icon', message: 'L\'icône ne peut pas dépasser 50 caractères', value: icon });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
};

// Validation pour les IDs dans les paramètres
export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  const idNum = parseInt(id);

  if (isNaN(idNum) || idNum < 1) {
    res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'id', message: 'ID invalide', value: id }]
    });
    return;
  }

  next();
};

// Validation pour les URLs
export const validateUrl = (req: Request, res: Response, next: NextFunction): void => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !isValidUrl(url.trim())) {
    res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'url', message: 'URL invalide', value: url }]
    });
    return;
  }

  next();
};