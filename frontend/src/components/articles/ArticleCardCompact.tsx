import React from 'react';
import { motion } from 'framer-motion';
import { Article } from '../../types/article.types';
import { FiExternalLink, FiCalendar, FiRss, FiStar } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useArticleSavedStatus } from '../../hooks/useSavedArticles';

interface ArticleCardCompactProps {
  article: Article;
  onClick?: () => void;
  onToggleFavorite?: (id: number) => void;
  onMarkAsRead?: (id: number) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
}

const ArticleCardCompact: React.FC<ArticleCardCompactProps> = ({
  article,
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

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all duration-300
        ${!article.isRead ? 'font-semibold' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
        border border-gray-200/50 dark:border-gray-700/50
        hover:bg-white/80 dark:hover:bg-gray-800/80
        hover:backdrop-blur-md hover:shadow-lg
        hover:border-gray-300/50 dark:hover:border-gray-600/50
      `}
      onClick={handleCardClick}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      )}

      <div className={`${selectionMode ? 'ml-8' : ''} flex gap-4`}>
        {/* Thumbnail image */}
        {article.imageUrl && (
          <div className="flex-shrink-0">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-24 h-24 object-cover rounded-lg"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex-1">
          {/* Header with date and actions */}
          <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FiCalendar className="w-3.5 h-3.5" />
              {article.publishedDate ? format(new Date(article.publishedDate), 'dd MMM yyyy', { locale: fr }) : 'Date inconnue'}
            </span>
            {article.source && (
              <span className="flex items-center gap-1">
                <FiRss className="w-3.5 h-3.5" />
                {article.source.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!article.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" title="Non lu" />
            )}
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-md transition-colors ${
                article.isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={article.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <FiStar className={`w-4 h-4 ${article.isFavorite ? 'fill-current' : ''}`} />
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
              <FaBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleLinkClick}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
              title="Ouvrir l'article original"
            >
              <FiExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg leading-tight text-gray-900 dark:text-white line-clamp-2">
          {article.title}
        </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCardCompact;
