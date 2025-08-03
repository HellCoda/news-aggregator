// Configuration des effets visuels (ombres, transitions, animations)

export const effects = {
  // Box shadows - Plus prononcées pour le mode clair
  shadow: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    
    // Shadows personnalisées - Plus visibles
    card: '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    cardHover: '0 8px 16px rgba(0, 0, 0, 0.15)',
    button: '0 2px 4px rgba(0, 0, 0, 0.12)',
    buttonHover: '0 4px 8px rgba(0, 0, 0, 0.18)',
    
    // Inner shadows
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Glassmorphism effects
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
  
  // Transitions
  transition: {
    all: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
    
    // Specific transitions
    colors: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
    transform: 'transform 0.3s ease',
    opacity: 'opacity 0.3s ease',
    shadow: 'box-shadow 0.3s ease',
    
    // Timing functions
    ease: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Animations
  animation: {
    // Fade animations
    fadeIn: {
      keyframes: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      duration: '0.5s',
      timing: 'ease-in-out',
    },
    fadeOut: {
      keyframes: {
        '0%': { opacity: 1 },
        '100%': { opacity: 0 },
      },
      duration: '0.5s',
      timing: 'ease-in-out',
    },
    
    // Slide animations
    slideIn: {
      keyframes: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      duration: '0.3s',
      timing: 'ease-out',
    },
    slideUp: {
      keyframes: {
        '0%': { transform: 'translateY(20px)', opacity: 0 },
        '100%': { transform: 'translateY(0)', opacity: 1 },
      },
      duration: '0.3s',
      timing: 'ease-out',
    },
    
    // Scale animations
    scaleIn: {
      keyframes: {
        '0%': { transform: 'scale(0.9)', opacity: 0 },
        '100%': { transform: 'scale(1)', opacity: 1 },
      },
      duration: '0.3s',
      timing: 'ease-out',
    },
    
    // Pulse animation
    pulse: {
      keyframes: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      duration: '2s',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    
    // Bounce animation
    bounce: {
      keyframes: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      duration: '0.5s',
      timing: 'ease-in-out',
    },
    
    // Spin animation
    spin: {
      keyframes: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      duration: '1s',
      timing: 'linear',
      iteration: 'infinite',
    },
  },
  
  // Blur effects
  blur: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '24px',
  },
};