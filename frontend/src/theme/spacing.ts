// Configuration des espacements et dimensions

export const spacing = {
  // Espacement de base (rem)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  
  // Espacement des conteneurs
  container: {
    padding: '1.5rem',
    maxWidth: '1280px',
  },
  
  // Espacement des sections
  section: {
    gap: '2rem',
    padding: '3rem',
  },
};

export const sizing = {
  // Hauteurs standards
  header: '64px',
  sidebar: {
    collapsed: '64px',
    expanded: '280px',
  },
  
  // Dimensions des cards
  card: {
    minHeight: '120px',
    maxWidth: '800px',
  },
  
  // Dimensions des modales
  modal: {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1200px',
  },
  
  // Dimensions des boutons
  button: {
    sm: {
      height: '32px',
      padding: '0 12px',
    },
    md: {
      height: '40px',
      padding: '0 16px',
    },
    lg: {
      height: '48px',
      padding: '0 24px',
    },
  },
  
  // Dimensions des inputs
  input: {
    sm: {
      height: '32px',
      padding: '0 12px',
    },
    md: {
      height: '40px',
      padding: '0 16px',
    },
    lg: {
      height: '48px',
      padding: '0 20px',
    },
  },
};

export const radius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
  
  // Radius spécifiques
  button: '8px',
  card: '12px',
  modal: '16px',
  input: '8px',
};