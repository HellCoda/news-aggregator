import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiX } from 'react-icons/fi';
import { Article } from '../types/article.types';
import ArticleList from '../components/articles/ArticleList';
import ArticleReader from '../components/articles/ArticleReader';
import { useArticles } from '../hooks/useArticles';
import { useViewMode } from '../hooks/useViewMode';
import { Card, CardBody, Button } from '../components/ui';
import ViewSelector from '../components/ui/ViewSelector';

const FavoritesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const [viewMode, setViewMode] = useViewMode('favoritesView', 'grid-3');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const { 
    articles, 
    loading, 
    error,
    markAsRead,
    toggleFavorite,
    deleteArticle,
    refresh
  } = useArticles({
    isFavorite: true, // Récupérer seulement les favoris
    search: searchTerm || undefined,
    categoryId: selectedCategory ? parseInt(selectedCategory) : undefined
  });

  // Extraire les catégories uniques des articles favoris
  const categories = Array.from(
    new Set(articles.map(article => article.source?.category?.name).filter(Boolean))
  );

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleRemoveFavorite = async (id: number) => {
    if (window.confirm('Retirer cet article des favoris ?')) {
      await toggleFavorite(id);
      refresh();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiStar className="text-yellow-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mes Favoris
                {articles.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({articles.length} article{articles.length > 1 ? 's' : ''})
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ViewSelector currentView={viewMode} onViewChange={setViewMode} />
              <Button
                onClick={refresh}
                variant="secondary"
                size="sm"
              >
                Actualiser
              </Button>
            </div>
          </div>

          {/* Filtres - Search is now in Header */}
          {categories.length > 0 && (
            <Card variant="glass">
              <CardBody className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Filtre par catégorie */}
                  <div className="sm:w-48">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags de filtres actifs */}
                {selectedCategory && (
                  <div className="flex gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                      Catégorie: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="hover:text-yellow-600"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </motion.div>

        {/* Liste des favoris */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ArticleList
            articles={articles}
            loading={loading}
            error={error}
            viewMode={viewMode}
            onArticleClick={handleArticleClick}
            onMarkAsRead={markAsRead}
            onToggleFavorite={handleRemoveFavorite}
            onDeleteArticle={deleteArticle}
            emptyMessage={
              searchTerm || selectedCategory
                ? "Aucun favori ne correspond à vos critères"
                : "Vous n'avez pas encore d'articles en favoris. Cliquez sur l'étoile d'un article pour l'ajouter aux favoris."
            }
          />
        </motion.div>
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

export default FavoritesPage;
