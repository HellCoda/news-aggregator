import React, { useState, useEffect } from 'react';
import SourceForm from '../components/sources/SourceForm';
import sourceService from '../services/sourceService';
import { Source, CreateSourceRequest } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [syncingSourceId, setSyncingSourceId] = useState<number | null>(null);

  useEffect(() => {
    fetchSources();
    fetchCategories();
  }, []);

  const fetchSources = async () => {
    try {
      const data = await sourceService.getSources();
      setSources(data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateSource = async (sourceData: CreateSourceRequest) => {
    const newSource = await sourceService.createSource(sourceData);
    setSources([...sources, newSource]);
    setShowForm(false);
    
    // Show success message
    alert(`✅ Source "${newSource.name}" ajoutée avec succès !`);
  };

  const handleSyncSource = async (sourceId: number) => {
    setSyncingSourceId(sourceId);
    try {
      const result = await sourceService.syncSource(sourceId);
      alert(`✅ Synchronisation terminée : ${result.articlesNew} nouveaux articles trouvés`);
      
      // Refresh source to update lastSync
      fetchSources();
    } catch (error) {
      alert(`❌ Erreur lors de la synchronisation : ${(error as Error).message}`);
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleToggleActive = async (source: Source) => {
    try {
      await sourceService.updateSource(source.id, { isActive: !source.isActive });
      setSources(sources.map(s => 
        s.id === source.id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch (error) {
      alert(`❌ Erreur lors de la mise à jour : ${(error as Error).message}`);
    }
  };

  const handleDeleteSource = async (sourceId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette source et tous ses articles ?')) {
      return;
    }

    try {
      await sourceService.deleteSource(sourceId);
      setSources(sources.filter(s => s.id !== sourceId));
    } catch (error) {
      alert(`❌ Erreur lors de la suppression : ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sources
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({sources.length} au total)
            </span>
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
            </svg>
            {showForm ? 'Annuler' : 'Ajouter une source'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nouvelle source
            </h2>
            <SourceForm
              onSubmit={handleCreateSource}
              onCancel={() => setShowForm(false)}
              categories={categories}
            />
          </div>
        )}

        {/* Sources list */}
        {sources.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Aucune source configurée
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Commencez par ajouter une source pour agréger des articles
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map(source => (
              <div
                key={source.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {source.name}
                    </h3>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-600 truncate block"
                    >
                      {source.url}
                    </a>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      source.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}
                  >
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Category */}
                {source.category && (
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${source.category.color}20`,
                        color: source.category.color
                      }}
                    >
                      {source.category.name}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                  <div>
                    Fréquence de sync : {source.syncFrequency} min
                  </div>
                  {source.lastSync && (
                    <div>
                      Dernière sync : {formatDistanceToNow(new Date(source.lastSync), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </div>
                  )}
                  {source.lastError && (
                    <div className="text-red-600 dark:text-red-400 text-xs">
                      Erreur : {source.lastError}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSyncSource(source.id)}
                    disabled={syncingSourceId === source.id || !source.isActive}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    {syncingSourceId === source.id ? 'Sync...' : 'Synchroniser'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(source)}
                    className={`px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                      source.isActive
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {source.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleDeleteSource(source.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesPage;
