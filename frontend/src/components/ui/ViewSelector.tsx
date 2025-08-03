import React from 'react';
import { ViewMode } from '../../types/view.types';
import { FiList } from 'react-icons/fi';
import { BsGrid3X3Gap, BsGrid3X2Gap } from 'react-icons/bs';

interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  const views: { mode: ViewMode; icon: React.ReactNode; title: string }[] = [
    { 
      mode: 'list', 
      icon: <FiList className="w-5 h-5" />, 
      title: 'Vue liste (2 colonnes)' 
    },
    { 
      mode: 'grid-3', 
      icon: <BsGrid3X2Gap className="w-5 h-5" />, 
      title: 'Vue grille (3 colonnes)' 
    },
    { 
      mode: 'grid-4', 
      icon: <BsGrid3X3Gap className="w-5 h-5" />, 
      title: 'Vue grille (4 colonnes)' 
    }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {views.map(({ mode, icon, title }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          title={title}
          className={`
            p-2 rounded-md transition-all duration-200
            ${currentView === mode 
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }
          `}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default ViewSelector;
