import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaBookmark, FaTags, FaStickyNote } from 'react-icons/fa';
import { useSavedArticles } from '../hooks/useSavedArticles';
import { useViewMode } from '../hooks/useViewMode';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ArticleReader from '../components/articles/ArticleReader';
import { SavedArticle } from '../types/article.types';
import Modal from '../components/ui/Modal';
import ViewSelector from '../components/ui/ViewSelector';
import SavedArticleCard from '../components/articles/SavedArticleCard';

const SavedArticlesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [viewMode, setViewMode] = useViewMode('savedView', 'grid-3');
  const [selectedArticle, setSelectedArticle] = useState<SavedArticle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    savedArticles,
    pagination,
    isLoading,
    deleteSavedArticle,
    updateSavedArticle
  } = useSavedArticles({
    page: currentPage,
    limit: 20,
    search: search || undefined
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article sauvegardé ?')) {
      deleteSavedArticle(id);
    }
  };

  const handleRead = (article: SavedArticle) => {
    setSelectedArticle(article);
    setIsReaderOpen(true);
  };

  const handleEdit = (article: SavedArticle) => {
    setSelectedArticle(article);
    setEditNotes(article.notes || '');
    setEditTags(article.tags || []);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedArticle) {
      updateSavedArticle({
        id: selectedArticle.id!,
        notes: editNotes,
        tags: editTags
      });
      setIsEditModalOpen(false);
      setSelectedArticle(null);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editTags.includes(tagInput.trim())) {
      setEditTags([...editTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  if (isLoading) return <LoadingSpinner />;

  const renderSavedArticles = () => {
    if (savedArticles.length === 0) {
      return (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {search 
              ? 'Aucun article sauvegardé ne correspond à votre recherche' 
              : 'Aucun article sauvegardé. Sauvegardez des articles pour les conserver même si leur source est supprimée.'}
          </p>
        </div>
      );
    }

    // Define grid classes based on view mode
    const getGridClasses = () => {
      switch (viewMode) {
        case 'list':
          return 'grid grid-cols-1 gap-4';
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
        {savedArticles.map(article => (
          <SavedArticleCard
            key={article.id}
            article={article}
            viewMode={viewMode}
            onRead={() => handleRead(article)}
            onEdit={() => handleEdit(article)}
            onDelete={() => handleDelete(article.id!)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <FaBookmark className="mr-3 text-blue-600" />
              Articles Sauvegardés
            </h1>
            <ViewSelector currentView={viewMode} onViewChange={setViewMode} />
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
            <p className="text-blue-700 dark:text-blue-300">
              <strong>{pagination?.total || 0}</strong> articles sauvegardés
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Ces articles sont conservés indépendamment de leur source d'origine
            </p>
          </div>
        </div>

        {renderSavedArticles()}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Précédent
            </button>
            <span className="px-4 py-2">
              Page {currentPage} sur {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Article Reader */}
        {isReaderOpen && selectedArticle && (
          <ArticleReader
            article={{
              id: selectedArticle.id!,
              title: selectedArticle.title,
              summary: selectedArticle.summary,
              content: selectedArticle.content,
              url: selectedArticle.url,
              author: selectedArticle.author,
              publishedDate: selectedArticle.published_date,
              sourceId: 0,
              isRead: true,
              isFavorite: false,
              isArchived: false,
              createdAt: selectedArticle.created_at || new Date().toISOString(),
              updatedAt: selectedArticle.updated_at || new Date().toISOString()
            }}
            onClose={() => {
              setIsReaderOpen(false);
              setSelectedArticle(null);
            }}
          />
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedArticle(null);
          }}
          title="Modifier les notes et tags"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaStickyNote className="inline mr-2" />
                Notes personnelles
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Ajoutez vos notes ici..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FaTags className="inline mr-2" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SavedArticlesPage;
