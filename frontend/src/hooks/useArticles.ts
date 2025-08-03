// frontend/src/hooks/useArticles.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Article, PaginatedResponse, ArticleFilters } from '../types';
import articleService from '../services/articleService';

interface UseArticlesOptions extends ArticleFilters {
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
  total: number;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  archiveArticle: (id: number) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
  fetchPage: (page: number) => Promise<void>;
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesResult {
  const {
    page = 1,
    limit = 20,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
    ...filters
  } = options;

  const [data, setData] = useState<PaginatedResponse<Article>>({
    data: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to avoid dependency issues
  const filtersRef = useRef(filters);
  const pageRef = useRef(page);
  const limitRef = useRef(limit);
  
  // Update refs when props change
  useEffect(() => {
    filtersRef.current = filters;
    pageRef.current = page;
    limitRef.current = limit;
  }, [filters, page, limit]);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getArticles({
        ...filtersRef.current,
        page: pageRef.current,
        limit: limitRef.current,
      });
      setData(response);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependencies - uses refs instead

  // Initial fetch
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.sourceId, filters.categoryId, filters.isRead, filters.isFavorite, filters.search]);

  // Auto refresh with separate effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Only refresh if not loading to avoid overlapping requests
      if (!loading) {
        fetchArticles();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, fetchArticles]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await articleService.markAsRead(id);
      // Update local state optimistically
      setData(prev => ({
        ...prev,
        data: prev.data.map(article =>
          article.id === id ? { ...article, isRead: true } : article
        ),
      }));
    } catch (err) {
      console.error('Error marking article as read:', err);
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: number) => {
    try {
      const updatedArticle = await articleService.toggleFavorite(id);
      // Update local state with the response
      setData(prev => ({
        ...prev,
        data: prev.data.map(article =>
          article.id === id ? updatedArticle : article
        ),
      }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, []);

  const archiveArticle = useCallback(async (id: number) => {
    try {
      await articleService.archiveArticle(id);
      // Remove from local state
      setData(prev => ({
        ...prev,
        data: prev.data.filter(article => article.id !== id),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1,
        },
      }));
    } catch (err) {
      console.error('Error archiving article:', err);
      throw err;
    }
  }, []);

  const deleteArticle = useCallback(async (id: number) => {
    try {
      await articleService.deleteArticle(id);
      // Remove from local state
      setData(prev => ({
        ...prev,
        data: prev.data.filter(article => article.id !== id),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1,
        },
      }));
    } catch (err) {
      console.error('Error deleting article:', err);
      throw err;
    }
  }, []);

  const fetchPage = useCallback(async (newPage: number) => {
    pageRef.current = newPage;
    await fetchArticles();
  }, [fetchArticles]);

  return {
    articles: data.data,
    loading,
    error,
    totalPages: data.pagination.totalPages,
    currentPage: data.pagination.page,
    total: data.pagination.total,
    refresh: fetchArticles,
    markAsRead,
    toggleFavorite,
    archiveArticle,
    deleteArticle,
    fetchPage,
  };
}

// Hook for article statistics
export function useArticleStats() {
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    favorites: 0,
    sources: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await articleService.getStats();
      setStats(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
// eslint-disable-next-line react-hooks/exhaustive-deps 
