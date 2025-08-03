// src/types/index.ts
export * from './article.types';
export * from './category.types';
export * from './view.types';

// Types pour les sources
export interface Source {
  id: number;
  name: string;
  url: string;
  rssUrl?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  isActive: boolean;
  syncFrequency: number;
  lastSync?: string;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSourceRequest {
  name: string;
  url: string;
  rssUrl?: string;
  categoryId?: number;
  syncFrequency?: number;
}

// Types pour les requêtes
export interface UpdateArticleRequest {
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface ArticleFilters {
  sourceId?: number;
  categoryId?: number;
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Type pour la pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}