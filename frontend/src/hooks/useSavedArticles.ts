import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import savedArticleService from '../services/savedArticleService';
import { toast } from 'react-hot-toast';

export const useSavedArticles = (params?: {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
}) => {
  const queryClient = useQueryClient();

  // Fetch saved articles
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['savedArticles', params],
    queryFn: () => savedArticleService.getSavedArticles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save article mutation
  const saveArticleMutation = useMutation({
    mutationFn: ({ articleId, notes, tags }: { articleId: number; notes?: string; tags?: string[] }) =>
      savedArticleService.saveArticle(articleId, { notes, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['articleSavedStatus'] });
      toast.success('Article sauvegardé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  });

  // Update saved article mutation
  const updateSavedArticleMutation = useMutation({
    mutationFn: ({ id, notes, tags }: { id: number; notes?: string; tags?: string[] }) =>
      savedArticleService.updateSavedArticle(id, { notes, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
      toast.success('Article mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  });

  // Delete saved article mutation
  const deleteSavedArticleMutation = useMutation({
    mutationFn: (id: number) => savedArticleService.deleteSavedArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
      queryClient.invalidateQueries({ queryKey: ['articleSavedStatus'] });
      toast.success('Article supprimé de la sauvegarde');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  });

  return {
    savedArticles: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    saveArticle: saveArticleMutation.mutate,
    updateSavedArticle: updateSavedArticleMutation.mutate,
    deleteSavedArticle: deleteSavedArticleMutation.mutate,
    isSaving: saveArticleMutation.isPending,
    isUpdating: updateSavedArticleMutation.isPending,
    isDeleting: deleteSavedArticleMutation.isPending,
  };
};

// Hook to check if a specific article is saved
export const useArticleSavedStatus = (articleId: number | null) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['articleSavedStatus', articleId],
    queryFn: () => savedArticleService.checkIfSaved(articleId!),
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000,
  });

  const toggleSaved = useCallback(async (notes?: string, tags?: string[]) => {
    if (!articleId) return;

    try {
      if (data?.data?.isSaved && data?.data?.savedArticle) {
        // Delete from saved
        await savedArticleService.deleteSavedArticle(data.data.savedArticle.id!);
        toast.success('Article retiré de la sauvegarde');
      } else {
        // Save article
        await savedArticleService.saveArticle(articleId, { notes, tags });
        toast.success('Article sauvegardé');
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['articleSavedStatus', articleId] });
      queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Une erreur est survenue');
    }
  }, [articleId, data, queryClient]);

  return {
    isSaved: data?.data?.isSaved || false,
    savedArticle: data?.data?.savedArticle || null,
    isLoading,
    toggleSaved,
  };
};
