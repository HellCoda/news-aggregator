// frontend/src/components/articles/ArticleCard.tsx
import React from 'react';
import { FaBookmark } from 'react-icons/fa';
import { Article } from '../../types/article.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useArticleSavedStatus } from '../../hooks/useSavedArticles';

interface ArticleCardProps {
  article: Article;
  onRead?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (article: Article) => void;
  showExcerpt?: boolean;
  isSelected?: boolean;
  showSaveButton?: boolean;
  showFavoriteButton?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onRead, 
  onToggleFavorite, 
  onDelete,
  onClick,
  showExcerpt = true,
  isSelected = false,
  showSaveButton = true,
  showFavoriteButton = true
}) => {
  // Hook pour gérer le statut de sauvegarde
  const { isSaved, toggleSaved } = useArticleSavedStatus(article.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on action buttons
    if ((e.target as HTMLElement).closest('.article-actions')) {
      return;
    }
    
    // Mark as read when clicking on the card
    if (!article.isRead && onRead) {
      onRead(article.id);
    }
    
    if (onClick) {
      onClick(article);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(article.id);
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSaved();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Supprimer définitivement cet article ?')) {
      onDelete(article.id);
    }
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.url) {
      window.open(article.url, '_blank');
    }
  };

  const timeAgo = article.publishedDate 
    ? formatDistanceToNow(new Date(article.publishedDate), { 
        addSuffix: true,
        locale: fr 
      })
    : null;

  return (
    <article
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
        transition-all duration-200 cursor-pointer overflow-hidden
        ${!article.isRead ? 'border-l-4 border-blue-500' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Image if available */}
      {article.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Hide image container if image fails to load
              (e.target as HTMLElement).parentElement!.style.display = 'none';
            }}
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Category badge on image */}
          {article.source?.category && (
            <span 
              className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded"
              style={{
                backgroundColor: article.source.category.color,
                color: 'white'
              }}
            >
              {article.source.category.name}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className={`
              text-lg font-semibold line-clamp-2
              ${article.isRead 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-900 dark:text-white'
              }
            `}>
              {article.title}
            </h3>
            
            {/* Meta info */}
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
              {article.source && (
                <>
                  <span className="font-medium">{article.source.name}</span>
                  <span>•</span>
                </>
              )}
              {timeAgo && <span>{timeAgo}</span>}
              {article.author && (
                <>
                  <span>•</span>
                  <span>{article.author}</span>
                </>
              )}
            </div>
          </div>

          {/* Favorite indicator */}
          {article.isFavorite && (
            <span className="text-yellow-500 text-xl ml-2">⭐</span>
          )}
        </div>

        {/* Excerpt or Summary */}
        {showExcerpt && (article.excerpt || article.summary || article.description) && (
          <div className="mb-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {article.excerpt || article.summary || article.description}
            </p>
            {article.excerpt && article.excerpt.length > 200 && (
              <button 
                onClick={handleReadMore}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-1"
              >
                Lire la suite →
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="article-actions flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Category badge (if not shown on image) */}
            {!article.imageUrl && article.source?.category && (
              <span 
                className="px-2 py-1 text-xs font-medium rounded"
                style={{
                  backgroundColor: `${article.source.category.color}20`,
                  color: article.source.category.color
                }}
              >
                {article.source.category.name}
              </span>
            )}

            {/* Read indicator for mobile */}
            <span className="sm:hidden">
              {article.isRead && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lu
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* External link button */}
            <button
              onClick={handleReadMore}
              className="p-2 rounded text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              title="Ouvrir l'article original"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>

            {/* Save button - NEW */}
            {showSaveButton && (
              <button
                onClick={handleSaveClick}
                className={`
                  p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-150
                  ${isSaved 
                    ? 'text-green-600' 
                    : 'text-gray-400 hover:text-green-600'
                  }
                `}
                title={isSaved ? 'Article sauvegardé' : 'Sauvegarder l\'article'}
              >
                <FaBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Favorite button */}
            {showFavoriteButton && (
              <button
              onClick={handleFavoriteClick}
              className={`
                p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-150
                ${article.isFavorite 
                  ? 'text-yellow-500' 
                  : 'text-gray-400 hover:text-yellow-500'
                }
              `}
              title={article.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <svg className="w-5 h-5" fill={article.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            )}

            {/* Read status indicator (desktop only) */}
            <div className={`
              hidden sm:block p-2 rounded
              ${article.isRead 
                ? 'text-green-500' 
                : 'text-gray-400'
              }
            `}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                title="Supprimer définitivement l'article"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;