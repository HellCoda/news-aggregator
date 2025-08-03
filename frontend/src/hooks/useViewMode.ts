import { useState, useEffect } from 'react';
import { ViewMode } from '../types/view.types';

export const useViewMode = (storageKey: string, defaultMode: ViewMode = 'list') => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return (saved as ViewMode) || defaultMode;
    } catch {
      return defaultMode;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, viewMode);
    } catch (error) {
      console.error('Failed to save view mode:', error);
    }
  }, [viewMode, storageKey]);

  return [viewMode, setViewMode] as const;
};
