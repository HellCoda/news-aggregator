import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import { useCategories } from '../../hooks/useCategories';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiBell,
  FiMenu,
  FiX
} from 'react-icons/fi';

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { categories } = useCategories();

  // Déterminer le contexte de recherche
  const getSearchContext = () => {
    const path = location.pathname;
    const categoryId = searchParams.get('category');
    
    if (path === '/favorites') return { type: 'favorites', placeholder: 'Rechercher dans les favoris...' };
    if (path === '/saved') return { type: 'saved', placeholder: 'Rechercher dans les articles sauvegardés...' };
    if (path === '/sources') return { type: 'sources', placeholder: 'Rechercher des sources...' };
    if (path === '/articles' && categoryId) {
      // Trouver le nom de la catégorie
      const category = categories.find(cat => cat.id === parseInt(categoryId));
      const categoryName = category ? category.name : 'cette catégorie';
      return { type: 'category', categoryId, placeholder: `Rechercher dans ${categoryName}...` };
    }
    if (path === '/articles') return { type: 'articles', placeholder: 'Rechercher dans tous les articles...' };
    return { type: 'global', placeholder: 'Rechercher...' };
  };

  const searchContext = getSearchContext();

  // Mettre à jour la recherche quand on change de page
  useEffect(() => {
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      setSearchQuery(currentSearch);
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('search', searchQuery);
      
      // Garder les paramètres existants (comme category)
      navigate(`${location.pathname}?${params.toString()}`);
    } else {
      // Si recherche vide, enlever le paramètre search
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      const queryString = params.toString();
      navigate(`${location.pathname}${queryString ? '?' + queryString : ''}`);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // TODO: Implémenter la synchronisation réelle
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <header className="bg-background-card border-b border-border-primary sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Menu button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            {isSidebarOpen ? <FiX /> : <FiMenu />}
          </Button>

          {/* Logo pour mobile - retiré car déjà dans la sidebar */}
          <div className="lg:hidden flex-1 text-center">
            {/* Espace vide pour maintenir le centrage du menu button */}
          </div>

          {/* Search bar - hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Input
                  variant={isSearchFocused ? 'outlined' : 'filled'}
                  placeholder={searchContext.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  leftIcon={<FiSearch className="w-5 h-5" />}
                  className="transition-all duration-300"
                />
                
                {/* Search suggestions - désactivées pour le moment */}
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 lg:ml-6">
            {/* Sync button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSync}
              title="Synchroniser"
              className="relative"
            >
              <FiRefreshCw 
                className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}
              />
            </Button>
            
            {/* Notifications button */}
            <Button
              variant="ghost"
              size="icon"
              title="Notifications"
              className="relative"
              onClick={() => setHasNotifications(false)}
            >
              <FiBell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-state-error rounded-full animate-pulse" />
              )}
            </Button>
            
            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch}>
            <Input
              variant="filled"
              size="sm"
              placeholder={searchContext.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FiSearch className="w-4 h-4" />}
            />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
