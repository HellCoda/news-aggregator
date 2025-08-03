import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

interface BackendStatusProps {
  children: React.ReactNode;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Test de connexion au backend
  const { data, error, isLoading } = useQuery({
    queryKey: ['backend-status'],
    queryFn: async () => {
      const response = await api.get('/health');
      return response.data;
    },
    retry: 10, // Réessayer 10 fois
    retryDelay: (attemptIndex) => Math.min(1000 * attemptIndex, 5000), // Délai progressif
    refetchInterval: false,
  });

  useEffect(() => {
    if (data) {
      setIsConnecting(false);
      setConnectionError(null);
    } else if (error && !isLoading) {
      setIsConnecting(false);
      setConnectionError('Impossible de se connecter au serveur');
    }
  }, [data, error, isLoading]);

  if (isConnecting || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            PANOPTIQUE
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Démarrage du serveur...
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Erreur de connexion
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {connectionError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BackendStatus;
