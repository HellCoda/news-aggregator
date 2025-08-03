import React, { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import { useViewMode } from '../hooks/useViewMode';
import ArticleList from '../components/articles/ArticleList';
import ArticleReader from '../components/articles/ArticleReader';
import ViewSelector from '../components/ui/ViewSelector';
import { Article } from '../types/article.types';
import articleService from '../services/articleService';
import syncService from '../services/syncService';
import { useSearchParams } from 'react-router-dom';


const ArticlesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const searchTerm = searchParams.get('search') || '';
  const [filterUnread, setFilterUnread] = useState(false);
  const [viewMode, setViewMode] = useViewMode('articlesView', 'list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoRefreshActive, setAutoRefreshActive] = useState(false);
  
  const { 
    articles, 
    loading, 
    error, 
    totalPages, 
    total,
    markAsRead,
    toggleFavorite,
    archiveArticle,
    refresh
  } = useArticles({
  page: currentPage,
  limit: 20,
  search: searchTerm || undefined,
  isRead: filterUnread ? false : undefined,
  categoryId: categoryId ? parseInt(categoryId) : undefined,
  autoRefresh: false, // Désactivé par défaut pour éviter trop de requêtes
  refreshInterval: 60000
});

  const handleArticleClick = (article: Article) => {
    if (selectionMode) {
      handleToggleSelect(article.id);
    } else {
      setSelectedArticle(article);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    // Clear selection when changing page
    if (selectionMode) {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} article(s) ?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await articleService.deleteMultiple(Array.from(selectedIds));
      alert(`${result.count} article(s) supprimé(s) avec succès`);
      setSelectedIds(new Set());
      setSelectionMode(false);
      refresh();
    } catch (error) {
      alert('Erreur lors de la suppression des articles');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    const filter = filterUnread ? 'non lus' : '';
    const categoryFilter = categoryId ? ' de cette catégorie' : '';
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer TOUS les articles ${filter}${categoryFilter} ?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await articleService.deleteAll({ 
        isRead: filterUnread ? false : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined
      });
      alert(`${result.count} article(s) supprimé(s) avec succès`);
      refresh();
    } catch (error) {
      alert('Erreur lors de la suppression des articles');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setAutoRefreshActive(true);
    try {
      await syncService.syncAll();
      
      // Rafraîchir périodiquement pendant 30 secondes pour voir les nouveaux articles apparaître
      const refreshInterval = setInterval(() => {
        refresh();
      }, 3000); // Rafraîchir toutes les 3 secondes
      
      // Message immédiat
      alert('Synchronisation lancée ! Les nouveaux articles vont apparaître progressivement.');
      
      // Arrêter le rafraîchissement après 30 secondes
      setTimeout(() => {
        clearInterval(refreshInterval);
        refresh(); // Un dernier rafraîchissement
        setIsSyncing(false);
        setAutoRefreshActive(false);
      }, 30000);
      
    } catch (error) {
      alert('Erreur lors de la synchronisation');
      console.error(error);
      setIsSyncing(false);
      setAutoRefreshActive(false);
    }
  };


  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Articles
              {total > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({total} au total)
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              {/* View Selector */}
              <ViewSelector currentView={viewMode} onViewChange={setViewMode} />
              
              {/* Selection Mode Toggle */}
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                  selectionMode 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {selectionMode ? 'Annuler' : 'Sélection'}
              </button>

              <button
                onClick={refresh}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                title="Recharger les articles depuis la base de données"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rafraîchir
              </button>

              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                title="Synchroniser avec les sources RSS/Web"
              >
                {isSyncing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                )}
                {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            </div>
          </div>

          {/* Auto-refresh indicator */}
          {autoRefreshActive && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-blue-700 dark:text-blue-300">
                Synchronisation en cours... Les nouveaux articles apparaissent automatiquement.
              </span>
            </div>
          )}

          {/* Selection Actions */}
          {selectionMode && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    {selectedIds.size === articles.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">
                    {selectedIds.size} article(s) sélectionné(s)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0 || isDeleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Supprimer la sélection
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Tout supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters only - Search is now in Header */}
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnread}
                onChange={(e) => {
                  setFilterUnread(e.target.checked);
                  setCurrentPage(1);
                }}
                className="mr-2 w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Non lus uniquement</span>
            </label>
          </div>
        </div>

        {/* Articles List with view mode */}
        <ArticleList
          articles={articles}
          loading={loading}
          error={error}
          viewMode={viewMode}
          onArticleClick={handleArticleClick}
          onMarkAsRead={markAsRead}
          onToggleFavorite={toggleFavorite}
          onArchiveArticle={archiveArticle}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          emptyMessage={
            searchTerm 
              ? "Aucun article ne correspond à votre recherche" 
              : filterUnread 
                ? "Aucun article non lu" 
                : "Aucun article disponible. Commencez par ajouter des sources !"
          }
        />

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-6 flex justify-center">
            <nav className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Précédent
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`
                        px-4 py-2 rounded-lg transition-colors duration-200
                        ${pageNum === currentPage
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onToggleFavorite={toggleFavorite}
          onMarkAsRead={markAsRead}
        />
      )}
    </div>
  );
};

export default ArticlesPage;
