// Index principal du thème - Export de toutes les configurations
import { lightTheme, darkTheme, commonColors } from './colors';
import { spacing, sizing, radius } from './spacing';
import { typography } from './typography';
import { effects } from './effects';

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './effects';


// Configuration complète du thème
export const theme = {
  colors: {
    light: lightTheme,
    dark: darkTheme,
    common: commonColors,
  },
  spacing,
  sizing,
  radius,
  typography,
  effects,
};

// Type helper pour TypeScript
export type AppTheme = typeof theme;

// Fonction helper pour obtenir les valeurs du thème
export const getThemeValue = (path: string, isDark: boolean = false) => {
  const keys = path.split('.');
  let value: any = theme;
  
  // Si on demande une couleur, on prend le bon thème
  if (keys[0] === 'colors' && keys[1] !== 'common') {
    keys[1] = isDark ? 'dark' : 'light';
  }
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value;
};

// Fonction pour convertir hex en rgb
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

// Variables CSS personnalisées pour une utilisation globale
export const generateCSSVariables = (isDark: boolean = false) => {
  const colors = isDark ? darkTheme : lightTheme;
  
  return `
    :root {
      /* Background colors */
      --bg-primary: ${colors.background.primary};
      --bg-secondary: ${colors.background.secondary};
      --bg-tertiary: ${colors.background.tertiary};
      --bg-card: ${colors.background.card};
      --bg-hover: ${colors.background.hover};
      
      /* Accent colors */
      --accent-primary: ${colors.accent.primary};
      --accent-primary-rgb: ${hexToRgb(colors.accent.primary)};
      --accent-secondary: ${colors.accent.secondary};
      --accent-hover: ${colors.accent.hover};
      --accent-light: ${colors.accent.light};
      
      /* Text colors */
      --text-primary: ${colors.text.primary};
      --text-secondary: ${colors.text.secondary};
      --text-tertiary: ${colors.text.tertiary};
      --text-inverse: ${colors.text.inverse};
      
      /* Border colors */
      --border-primary: ${colors.border.primary};
      --border-secondary: ${colors.border.secondary};
      --border-light: ${colors.border.light};
      
      /* State colors */
      --state-success: ${colors.state.success};
      --state-error: ${colors.state.error};
      --state-warning: ${colors.state.warning};
      --state-info: ${colors.state.info};
      
      /* Category colors */
      --cat-actualites: ${colors.category.actualites};
      --cat-technologie: ${colors.category.technologie};
      --cat-sport: ${colors.category.sport};
      --cat-culture: ${colors.category.culture};
      --cat-science: ${colors.category.science};
      
      /* Effects */
      --shadow-color: ${colors.shadow};
      --overlay-color: ${colors.overlay};
      
      /* Spacing */
      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};
      
      /* Radius */
      --radius-sm: ${radius.sm};
      --radius-md: ${radius.md};
      --radius-lg: ${radius.lg};
      --radius-xl: ${radius.xl};
      
      /* Typography */
      --font-sans: ${typography.fontFamily.sans.join(', ')};
      --font-mono: ${typography.fontFamily.mono.join(', ')};
    }
  `;
};