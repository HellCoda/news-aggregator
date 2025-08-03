// frontend/src/components/articles/ArticleReader.tsx
import React, { useEffect, useState } from 'react';
import { Article } from '../../types/article.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface ArticleReaderProps {
  article: Article;
  onClose: () => void;
  onToggleFavorite?: (id: number) => void;
  onMarkAsRead?: (id: number) => void;
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ 
  article, 
  onClose, 
  onToggleFavorite,
  onMarkAsRead 
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    // Mark as read when opening the reader
    if (!article.isRead && onMarkAsRead) {
      onMarkAsRead(article.id);
    }
  }, [article.id, article.isRead, onMarkAsRead]);

  const timeAgo = article.publishedDate 
    ? formatDistanceToNow(new Date(article.publishedDate), { 
        addSuffix: true,
        locale: fr 
      })
    : null;

  // Sanitize HTML content
  const sanitizedContent = article.content 
    ? DOMPurify.sanitize(article.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                      'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'pre', 'code'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
      })
    : '';

  const sanitizedExcerpt = article.excerpt 
    ? DOMPurify.sanitize(article.excerpt, { ALLOWED_TAGS: ['p', 'br'] })
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-4 sm:inset-8 md:inset-16 lg:inset-x-32 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {article.source && (
                <>
                  <span className="font-medium">{article.source.name}</span>
                  {article.source.category && (
                    <>
                      <span>•</span>
                      <span 
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${article.source.category.color}20`,
                          color: article.source.category.color
                        }}
                      >
                        {article.source.category.name}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorite button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(article.id)}
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
                <svg className="w-6 h-6" fill={article.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            )}

            {/* Open in browser */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Ouvrir dans le navigateur"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <article className="max-w-4xl mx-auto p-6 sm:p-8">
            {/* Featured image */}
            {article.imageUrl && (
              <div className="mb-6 -mx-6 sm:-mx-8">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b dark:border-gray-700">
              {article.author && (
                <>
                  <span>Par {article.author}</span>
                  <span>•</span>
                </>
              )}
              {timeAgo && <span>{timeAgo}</span>}
              {article.publishedDate && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(article.publishedDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </>
              )}
            </div>

            {/* Content display logic */}
            {showFullContent && article.content ? (
              <>
                {/* Full content */}
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
                
                {/* Link to original */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Cet article est un aperçu. Pour lire l'article complet :
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Lire sur {article.source?.name || 'le site original'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </>
            ) : (
              <>
                {/* Excerpt only */}
                {article.excerpt ? (
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: sanitizedExcerpt }}
                  />
                ) : article.summary ? (
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {article.summary}
                  </p>
                ) : article.description ? (
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {article.description}
                  </p>
                ) : null}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {article.content && (
                    <button
                      onClick={() => setShowFullContent(true)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Lire l'aperçu complet
                    </button>
                  )}
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Lire l'article complet sur {article.source?.name || 'le site'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </>
            )}
          </article>
        </div>
      </div>
    </div>
  );
};

export default ArticleReader;