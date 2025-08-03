import api from './api';
import { SavedArticle } from '../types/article.types';

export interface SaveArticleRequest {
  notes?: string;
  tags?: string[];
}

export interface SavedArticlesResponse {
  success: boolean;
  data: SavedArticle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SavedArticleResponse {
  success: boolean;
  data: SavedArticle;
  message?: string;
}

export interface SavedStatusResponse {
  success: boolean;
  data: {
    isSaved: boolean;
    savedArticle: SavedArticle | null;
  };
}

class SavedArticleService {
  /**
   * Save an article permanently
   */
  async saveArticle(articleId: number, data?: SaveArticleRequest): Promise<SavedArticleResponse> {
    const response = await api.post(`/articles/${articleId}/save`, data);
    return response.data;
  }

  /**
   * Get all saved articles
   */
  async getSavedArticles(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    search?: string;
  }): Promise<SavedArticlesResponse> {
    const response = await api.get('/saved-articles', { params });
    return response.data;
  }

  /**
   * Get a specific saved article
   */
  async getSavedArticleById(id: number): Promise<SavedArticleResponse> {
    const response = await api.get(`/saved-articles/${id}`);
    return response.data;
  }

  /**
   * Update a saved article (notes/tags)
   */
  async updateSavedArticle(id: number, data: SaveArticleRequest): Promise<SavedArticleResponse> {
    const response = await api.put(`/saved-articles/${id}`, data);
    return response.data;
  }

  /**
   * Delete a saved article
   */
  async deleteSavedArticle(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/saved-articles/${id}`);
    return response.data;
  }

  /**
   * Check if an article is saved
   */
  async checkIfSaved(articleId: number): Promise<SavedStatusResponse> {
    const response = await api.get(`/articles/${articleId}/saved-status`);
    return response.data;
  }
}

export default new SavedArticleService();
