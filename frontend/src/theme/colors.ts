// Définition complète des palettes de couleurs pour PANOPTIQUE

export const lightTheme = {
  // Couleurs principales - Palette plus contrastée
  background: {
    primary: '#FFF5EE', // Blanc pur au lieu de coquille d'œuf
    secondary: '#F8F9FA', // Gris très clair
    tertiary: '#F3F4F6', // Gris clair
    card: '#f6bd60',
    hover: '#F0F0F0',
  },
  
  // Accentuation - Plus vive
  accent: {
    primary: '#f0f0f0', // Jaune doré vif
    secondary: '#000000', // Orange doré
    hover: '#FF8C00',
    light: '#FFE4B5',
  },
  
  // Texte - Plus contrasté
  text: {
    primary: '#1A1A1A', // Noir profond
    secondary: '#141314', // Gris foncé
    tertiary: '#1a1b1c', // Gris moyen
    inverse: '#FFFFFF',
  },
  
  // Bordures - Plus visibles
  border: {
    primary: '#E5E7EB', // Gris clair mais visible
    secondary: '#D1D5DB',
    light: '#F3F4F6',
  },
  
  // États - Plus vifs
  state: {
    success: '#10B981', // Vert émeraude
    error: '#EF4444', // Rouge vif
    warning: '#F59E0B', // Ambre
    info: '#3B82F6', // Bleu vif
  },
  
  // Catégories - Couleurs vives
  category: {
    actualites: '#EF4444', // Rouge vif
    technologie: '#3B82F6', // Bleu vif
    sport: '#10B981', // Vert vif
    culture: '#8B5CF6', // Violet vif
    science: '#F59E0B', // Orange vif
  },
  
  // Effets
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.2)',
};

export const darkTheme = {
  // Couleurs principales - Palette Violet/Pourpre
  background: {
    primary: '#1A1625', // Anthracite violet
    secondary: '#252131', // Pourpre foncé
    tertiary: '#2D2839', // Violet gris
    card: '#322C3E',
    hover: '#3A3448',
  },
  
  // Accentuation
  accent: {
    primary: '#7C3AED', // Violet vif
    secondary: '#9333EA', // Violet plus intense
    hover: '#A855F7',
    light: '#C084FC',
  },
  
  // Texte
  text: {
    primary: '#E9E4F0', // Lavande clair
    secondary: '#C4B5D6', // Lavande moyen
    tertiary: '#9F90B3', // Lavande foncé
    inverse: '#1A1625',
  },
  
  // Bordures
  border: {
    primary: '#3B3547', // Violet gris
    secondary: '#4A4356',
    light: '#2F2A3A',
  },
  
  // États
  state: {
    success: '#34D399', // Vert menthe
    error: '#F87171', // Rouge corail
    warning: '#FBBF24', // Jaune ambre
    info: '#60A5FA', // Bleu ciel
  },
  
  // Catégories
  category: {
    actualites: '#F87171', // Rouge corail
    technologie: '#60A5FA', // Bleu ciel
    sport: '#34D399', // Vert menthe
    culture: '#A78BFA', // Violet clair
    science: '#FBBF24', // Jaune ambre
  },
  
  // Effets
  shadow: 'rgba(0, 0, 0, 0.25)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export type Theme = typeof lightTheme;

// Export des couleurs communes
export const commonColors = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Focus states
  focus: {
    light: '#FFE4A1',
    dark: '#7C3AED',
  },
};