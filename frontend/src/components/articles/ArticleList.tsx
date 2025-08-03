import React from 'react';
import { Article } from '../../types/article.types';
import { ViewMode } from '../../types/view.types';
import ArticleCard from './ArticleCard';
import ArticleCardCompact from './ArticleCardCompact';
import ArticleCardWithImage from './ArticleCardWithImage';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
  error?: Error | null;
  viewMode?: ViewMode;
  onArticleClick?: (article: Article) => void;
  onMarkAsRead?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  onDeleteArticle?: (id: number) => void;
  onArchiveArticle?: (id: number) => void;
  emptyMessage?: string;
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  loading = false,
  error = null,
  viewMode = 'list',
  onArticleClick,
  onMarkAsRead,
  onToggleFavorite,
  onDeleteArticle,
  onArchiveArticle,
  emptyMessage = "Aucun article à afficher",
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelect
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-400">
            Erreur lors du chargement des articles : {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  
  const renderArticle = (article: Article) => {
    const commonProps = {
      article,
      onClick: () => onArticleClick?.(article),
      onToggleFavorite,
      onMarkAsRead,
      onDelete: onDeleteArticle,
      isSelected: selectionMode && selectedIds.has(article.id),
      onToggleSelect: () => onToggleSelect?.(article.id),
      selectionMode
    };

    switch (viewMode) {
      case 'list':
        return <ArticleCardCompact key={article.id} {...commonProps} />;
      case 'grid-3':
        return <ArticleCardWithImage key={article.id} {...commonProps} size="medium" />;
      case 'grid-4':
        return <ArticleCardWithImage key={article.id} {...commonProps} size="small" />;
      default:
        return <ArticleCard key={article.id} {...commonProps} />;
    }
  };

  // Define grid classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case 'list':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'grid-3':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'grid-4':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
      default:
        return 'space-y-4';
    }
  };

  return (
    <div className={getGridClasses()}>
      {articles.map(renderArticle)}
    </div>
  );
};

export default ArticleList;
