// backend/src/types/index.ts

// Article types
export interface Article {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  description?: string;  // Ajout de description
  url: string;
  author?: string;
  publishedDate?: Date | string;  // Rendu optionnel
  sourceId: number;
  source?: {  // Relation optionnelle avec la source
    id: number;
    name: string;
    url: string;
    categoryId?: number;
    category?: Category;
  };
  isRead: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  readAt?: Date | string;
  favoritedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  imageUrl?: string;
  excerpt?: string;
}

export interface CreateArticleData {
  title: string;
  content?: string;
  summary?: string;
  description?: string;  // Ajout de description
  url: string;
  author?: string;
  publishedDate?: Date | string;
  sourceId: number;
  imageUrl?: string;
  excerpt?: string;
}

// Source types
export interface Source {
  id: number;
  name: string;
  url: string;
  rssUrl?: string;
  scraperConfig?: ScraperConfig;
  categoryId?: number;
  category?: Category;  // Optional category relation
  isActive: boolean;
  syncFrequency: number;
  lastSync?: Date | string;
  lastError?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateSourceRequest {
  name: string;
  url: string;
  rssUrl?: string;
  scraperConfig?: ScraperConfig;
  categoryId?: number;
  syncFrequency?: number;
}

export interface UpdateSourceRequest {
  name?: string;
  url?: string;
  rssUrl?: string;
  scraperConfig?: ScraperConfig;
  categoryId?: number;
  isActive?: boolean;
  syncFrequency?: number;
}

// Category types
export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon?: string;
}

// Scraper configuration
export interface ScraperConfig {
  selectors: {
    title?: string;
    content?: string;
    author?: string;
    date?: string;
    excerpt?: string;
    image?: string;
  };
  removeSelectors?: string[];
  dateFormat?: string;
}

// Sync types
export interface SyncResult {
  found: number;
  new: number;
  updated: number;
  errors: string[];
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sourceId?: number;
  categoryId?: number;
  isRead?: boolean;
  isFavorite?: boolean;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Propriétés additionnelles pour compatibilité
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// User preferences
export interface UserPreference {
  key: string;
  value: string;
}

// Article filters for queries
export interface ArticleFilters extends PaginationParams {
  sourceId?: number;
  categoryId?: number;
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

// Update article request
export interface UpdateArticleRequest {
  isRead?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}