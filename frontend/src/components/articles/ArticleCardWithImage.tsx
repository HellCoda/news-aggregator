import React from 'react';
import { motion } from 'framer-motion';
import { Article } from '../../types/article.types';
import { FiExternalLink, FiCalendar, FiRss, FiStar, FiUser } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useArticleSavedStatus } from '../../hooks/useSavedArticles';

interface ArticleCardWithImageProps {
  article: Article;
  size: 'medium' | 'small';
  onClick?: () => void;
  onToggleFavorite?: (id: number) => void;
  onMarkAsRead?: (id: number) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
}

const ArticleCardWithImage: React.FC<ArticleCardWithImageProps> = ({
  article,
  size,
  onClick,
  onToggleFavorite,
  onMarkAsRead,
  isSelected = false,
  onToggleSelect,
  selectionMode = false
}) => {
  // Hook pour gérer le statut de sauvegarde
  const { isSaved, toggleSaved } = useArticleSavedStatus(article.id);
  const handleCardClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect();
    } else if (onClick) {
      onClick();
      if (onMarkAsRead && !article.isRead) {
        onMarkAsRead(article.id);
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(article.id);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(article.url, '_blank');
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSaved();
  };

  const isSmall = size === 'small';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        relative flex flex-col h-full rounded-xl cursor-pointer transition-all duration-300
        ${!article.isRead ? 'font-semibold' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
        border border-gray-200/50 dark:border-gray-700/50
        hover:bg-white/80 dark:hover:bg-gray-800/80
        hover:backdrop-blur-md hover:shadow-xl
        hover:border-gray-300/50 dark:hover:border-gray-600/50
        overflow-hidden
      `}
      onClick={handleCardClick}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white"
          />
        </div>
      )}

      {/* Image or placeholder */}
      {article.imageUrl ? (
        <div className={`relative ${isSmall ? 'h-32' : 'h-48'} overflow-hidden bg-gray-100 dark:bg-gray-700`}>
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {!article.isRead && (
            <div className="absolute top-2 right-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full block shadow-lg" />
            </div>
          )}
        </div>
      ) : (
        <div className={`
          relative ${isSmall ? 'h-32' : 'h-48'} 
          bg-gradient-to-br from-gray-100 to-gray-200 
          dark:from-gray-700 dark:to-gray-800
          flex items-center justify-center
        `}>
          <FiRss className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          {!article.isRead && (
            <div className="absolute top-2 right-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full block shadow-lg" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Source and date */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1 truncate">
            <FiRss className="w-3 h-3 flex-shrink-0" />
            {article.source?.name || 'Source inconnue'}
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <FiCalendar className="w-3 h-3" />
            {article.publishedDate ? format(new Date(article.publishedDate), isSmall ? 'dd/MM' : 'dd MMM', { locale: fr }) : ''}
          </span>
        </div>

        {/* Title */}
        <h3 className={`
          ${isSmall ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'} 
          flex-1 leading-tight text-gray-900 dark:text-white mb-2
        `}>
          {article.title}
        </h3>

        {/* Summary - only for medium size */}
        {!isSmall && article.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}

        {/* Author and actions */}
        <div className="flex items-center justify-between mt-auto">
          {article.author && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate">
              <FiUser className="w-3 h-3" />
              {article.author}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-md transition-colors ${
                article.isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={article.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <FiStar className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${article.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleSaveClick}
              className={`p-1.5 rounded-md transition-colors ${
                isSaved 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-400 hover:text-green-600 dark:hover:text-gray-300'
              }`}
              title={isSaved ? 'Article sauvegardé' : 'Sauvegarder l\'article'}
            >
              <FaBookmark className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleLinkClick}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
              title="Ouvrir l'article original"
            >
              <FiExternalLink className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCardWithImage;
