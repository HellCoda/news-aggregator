import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Contexts
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import BackendStatus from './components/common/BackendStatus';

// Pages
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import SourcesPage from './pages/SourcesPage';
import FavoritesPage from './pages/FavoritesPage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import SettingsPage from './pages/SettingsPage';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ThemeProvider>
          <BackendStatus>
            <Router future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}>
              <Toaster position="top-right" />
              <div className="flex h-screen bg-background-primary">
            {/* Sidebar avec overlay pour mobile */}
            <>
              {/* Overlay mobile */}
              {isSidebarOpen && (
                <div 
                  className="lg:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              
              {/* Sidebar */}
              <div className={`
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 fixed lg:relative z-50 h-full transition-transform duration-300
              `}>
                <Sidebar />
              </div>
            </>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header 
                onMenuToggle={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
              />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-primary">
                <div className="page-transition">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/articles" element={<ArticlesPage />} />
                    <Route path="/sources" element={<SourcesPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/saved" element={<SavedArticlesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
            </Router>
          </BackendStatus>
        </ThemeProvider>
    </AppProvider>
  </QueryClientProvider>
  );
}

export default App;