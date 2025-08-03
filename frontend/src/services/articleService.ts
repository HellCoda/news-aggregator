// frontend/src/services/articleService.ts
import { apiHelpers } from './api';
import { Article, ArticleAPI, transformArticle, transformArticleToAPI, PaginatedResponse, ArticleFilters, UpdateArticleRequest } from '../types';

export const articleService = {
  /**
   * Get paginated articles with optional filters
   */
  getArticles: async (params?: ArticleFilters & { page?: number; limit?: number }) => {
  const response = await apiHelpers.get<PaginatedResponse<ArticleAPI>>('/articles', params);
  return {
    ...response,
    data: response.data.map(transformArticle)
  };
},

  /**
   * Get a single article by ID
   */
  getArticle: async (id: number) => {
    return apiHelpers.get<Article>(`/articles/${id}`);
  },

  /**
   * Update an article
   */
  updateArticle: async (id: number, updates: UpdateArticleRequest) => {
  const apiUpdates = transformArticleToAPI(updates);
  const response = await apiHelpers.put<ArticleAPI>(`/articles/${id}`, apiUpdates);
  return transformArticle(response);
},

  /**
   * Mark an article as read
   */
  markAsRead: async (id: number) => {
    return apiHelpers.post<Article>(`/articles/${id}/read`);
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (id: number) => {
    return apiHelpers.post<Article>(`/articles/${id}/favorite`);
  },

  /**
   * Archive an article (soft delete)
   */
  archiveArticle: async (id: number) => {
    return apiHelpers.post<{ message: string; article: Article }>(`/articles/${id}/archive`);
  },

  /**
   * Delete an article (permanent delete)
   */
  deleteArticle: async (id: number) => {
    return apiHelpers.delete<void>(`/articles/${id}`);
  },

  /**
   * Get articles statistics
   */
  getStats: async () => {
    return apiHelpers.get<{
      total: number;
      unread: number;
      favorites: number;
      sources: number;
    }>('/articles/stats');
  },

  /**
   * Get unread articles
   */
  getUnreadArticles: async (page?: number, limit?: number) => {
    return articleService.getArticles({ isRead: false, page, limit });
  },

  /**
   * Get favorite articles
   */
  getFavoriteArticles: async (page?: number, limit?: number) => {
    return articleService.getArticles({ isFavorite: true, page, limit });
  },

  /**
   * Search articles
   */
  searchArticles: async (search: string, page?: number, limit?: number) => {
    return articleService.getArticles({ search, page, limit });
  },

  /**
   * Delete multiple articles
   */
  deleteMultiple: async (ids: number[]) => {
    return apiHelpers.post<{ message: string; count: number }>('/articles/delete-multiple', { ids });
  },

  /**
   * Delete all articles with optional filters
   */
  deleteAll: async (filters?: { sourceId?: number; categoryId?: number; isRead?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.sourceId) params.append('sourceId', filters.sourceId.toString());
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    return apiHelpers.delete<{ message: string; count: number }>(`/articles/all?${params.toString()}`);
  },

  /**
   * Delete old articles
   */
  deleteOld: async (days: number = 15) => {
    return apiHelpers.delete<{ message: string; count: number }>(`/articles/old?days=${days}`);
  },
};

export default articleService;
