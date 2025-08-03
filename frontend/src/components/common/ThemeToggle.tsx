import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <FiMonitor className="w-5 h-5" />;
    }
    return resolvedTheme === 'light' ? (
      <FiSun className="w-5 h-5" />
    ) : (
      <FiMoon className="w-5 h-5" />
    );
  };

  const getTooltip = () => {
    if (theme === 'light') return 'Passer en mode sombre';
    if (theme === 'dark') return 'Passer en mode système';
    return 'Passer en mode clair';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={getTooltip()}
      className="rounded-full hover:bg-accent-light/20"
    >
      {getIcon()}
    </Button>
  );
};