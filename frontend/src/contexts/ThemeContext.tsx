import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateCSSVariables } from '../theme';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'panoptique-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème depuis localStorage
    const stored = localStorage.getItem(storageKey) as Theme;
    return stored || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Déterminer le thème résolu
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const isDark = e.matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        root.classList.remove('light', 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
        
        // Injecter les variables CSS
        const style = document.createElement('style');
        style.innerHTML = generateCSSVariables(isDark);
        document.head.appendChild(style);
        
        return () => document.head.removeChild(style);
      };

      handleChange(mediaQuery);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      const isDark = theme === 'dark';
      setResolvedTheme(isDark ? 'dark' : 'light');
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Injecter les variables CSS
      const style = document.createElement('style');
      style.innerHTML = generateCSSVariables(isDark);
      document.head.appendChild(style);
      
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [theme]);

  // Sauvegarder le thème dans localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};