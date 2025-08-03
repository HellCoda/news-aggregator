import React from 'react';
import { FaEye, FaEdit, FaTrash, FaTags, FaStickyNote, FaClock, FaUser } from 'react-icons/fa';
import { SavedArticle } from '../../types/article.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ViewMode } from '../../types/view.types';

interface SavedArticleCardProps {
  article: SavedArticle;
  viewMode: ViewMode;
  onRead: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SavedArticleCard: React.FC<SavedArticleCardProps> = ({
  article,
  viewMode,
  onRead,
  onEdit,
  onDelete
}) => {
  const timeAgo = article.published_date 
    ? formatDistanceToNow(new Date(article.published_date), { 
        addSuffix: true,
        locale: fr 
      })
    : null;

  const savedAgo = article.created_at
    ? formatDistanceToNow(new Date(article.created_at), {
        addSuffix: true,
        locale: fr
      })
    : null;

  // Extract image from content if available
  const extractImageUrl = (content: string | null | undefined): string | undefined => {
    if (!content) return undefined;
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : undefined;
  };

  const imageUrl = extractImageUrl(article.content);

  // Render compact list view
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
              {article.title}
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
              {article.author && (
                <span className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  {article.author}
                </span>
              )}
              {timeAgo && (
                <span className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {timeAgo}
                </span>
              )}
              {savedAgo && (
                <span className="text-xs">
                  Sauvegardé {savedAgo}
                </span>
              )}
            </div>

            {article.summary && (
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                {article.summary}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <FaTags className="w-3 h-3 text-gray-400" />
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {article.notes && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <FaStickyNote className="w-3 h-3" />
                  Notes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onRead}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Lire l'article"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Modifier les notes et tags"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer l'article"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render card view (grid-3, grid-4)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {imageUrl && (
        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img 
            src={imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
          {article.author && (
            <span className="flex items-center gap-1">
              <FaUser className="w-3 h-3" />
              {article.author}
            </span>
          )}
          {timeAgo && (
            <span className="flex items-center gap-1">
              <FaClock className="w-3 h-3" />
              {timeAgo}
            </span>
          )}
        </div>

        {article.summary && (
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 flex-1">
            {article.summary}
          </p>
        )}

        <div className="space-y-2 mb-3">
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <FaTags className="w-3 h-3 text-gray-400" />
              {article.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {article.notes && (
              <span className="flex items-center gap-1">
                <FaStickyNote className="w-3 h-3" />
                Notes ajoutées
              </span>
            )}
            {savedAgo && (
              <span>Sauvegardé {savedAgo}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onRead}
            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FaEye className="w-4 h-4" />
            Lire
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Modifier"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedArticleCard;
