// frontend/src/components/sources/SourceForm.tsx
import React, { useState } from 'react';
import { CreateSourceRequest } from '../../types';

interface SourceFormProps {
  onSubmit: (source: CreateSourceRequest) => Promise<void>;
  onCancel?: () => void;
  categories: Array<{ id: number; name: string; color: string }>;
}

const SourceForm: React.FC<SourceFormProps> = ({ onSubmit, onCancel, categories }) => {
  const [formData, setFormData] = useState<CreateSourceRequest>({
    name: '',
    url: '',
    rssUrl: '',
    categoryId: undefined,
    syncFrequency: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testingRss, setTestingRss] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' || name === 'syncFrequency' 
        ? value ? parseInt(value) : undefined 
        : value
    }));
  };

  const handleTestRss = async () => {
    if (!formData.rssUrl) {
      setError('Veuillez entrer une URL RSS');
      return;
    }

    setTestingRss(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/sources/test-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.rssUrl })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Flux RSS invalide');
      }

      alert(`✅ Flux RSS valide ! ${data.articlesCount} articles trouvés.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTestingRss(false);
    }
  };

  const handleDetectRss = async () => {
    if (!formData.url) {
      setError('Veuillez entrer l\'URL du site');
      return;
    }

    setTestingRss(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/sources/detect-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la détection');
      }

      if (data.feeds && data.feeds.length > 0) {
        setFormData(prev => ({ ...prev, rssUrl: data.feeds[0] }));
        alert(`✅ Flux RSS détecté : ${data.feeds[0]}`);
      } else {
        // Aucun flux RSS trouvé, proposer RSS-Bridge
        const confirmed = window.confirm(
          `❌ Aucun flux RSS trouvé sur ce site.\n\n` +
          `👉 Solution : Utilisez RSS-Bridge pour créer un flux RSS !\n\n` +
          `RSS-Bridge est un outil qui permet de générer des flux RSS pour les sites qui n'en ont pas.\n\n` +
          `Voulez-vous ouvrir le guide d'installation de RSS-Bridge ?`
        );
        
        if (confirmed) {
          window.open('https://github.com/RSS-Bridge/rss-bridge#installation', '_blank');
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTestingRss(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url) {
      setError('Le nom et l\'URL sont obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        url: '',
        rssUrl: '',
        categoryId: undefined,
        syncFrequency: 30
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom de la source *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Ex: Le Monde Tech"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL du site *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="https://example.com"
          />
          <button
            type="button"
            onClick={handleDetectRss}
            disabled={testingRss || !formData.url}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Détecter RSS
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL du flux RSS
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            name="rssUrl"
            value={formData.rssUrl}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="https://example.com/rss"
          />
          <button
            type="button"
            onClick={handleTestRss}
            disabled={testingRss || !formData.rssUrl}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {testingRss ? 'Test...' : 'Tester'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Catégorie
          </label>
          <select
            name="categoryId"
            value={formData.categoryId || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fréquence de sync (min)
          </label>
          <input
            type="number"
            name="syncFrequency"
            value={formData.syncFrequency}
            onChange={handleChange}
            min="5"
            max="1440"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter la source'}
        </button>
      </div>
    </form>
  );
};

export default SourceForm;
