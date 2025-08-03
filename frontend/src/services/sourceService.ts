// frontend/src/services/sourceService.ts
import { apiHelpers } from './api';
import { Source, CreateSourceRequest } from '../types';

export const sourceService = {
  /**
   * Get all sources
   */
  getSources: async (activeOnly?: boolean) => {
    return apiHelpers.get<Source[]>('/sources', { active: activeOnly });
  },

  /**
   * Get a single source by ID
   */
  getSource: async (id: number) => {
    return apiHelpers.get<Source>(`/sources/${id}`);
  },

  /**
   * Create a new source
   */
  createSource: async (source: CreateSourceRequest) => {
    return apiHelpers.post<Source>('/sources', source);
  },

  /**
   * Update a source
   */
  updateSource: async (id: number, updates: Partial<Source>) => {
    return apiHelpers.put<Source>(`/sources/${id}`, updates);
  },

  /**
   * Delete a source
   */
  deleteSource: async (id: number) => {
    return apiHelpers.delete<void>(`/sources/${id}`);
  },

  /**
   * Test RSS feed
   */
  testRSSFeed: async (url: string) => {
    return apiHelpers.post<{
      valid: boolean;
      articlesCount: number;
      articles: any[];
    }>('/sources/test-rss', { url });
  },

  /**
   * Detect RSS feeds from a website
   */
  detectRSSFeeds: async (url: string) => {
    return apiHelpers.post<{ feeds: string[] }>('/sources/detect-rss', { url });
  },

  /**
   * Sync articles for a specific source
   */
  syncSource: async (id: number) => {
    return apiHelpers.post<{
      success: boolean;
      articlesFound: number;
      articlesNew: number;
      errors: string[];
    }>(`/sources/${id}/sync`);
  },
};

export default sourceService;
