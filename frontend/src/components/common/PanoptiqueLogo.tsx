import React from 'react';

interface PanoptyqueLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const PanoptiqueLogo: React.FC<PanoptyqueLogoProps> = ({ 
  size = 40, 
  showText = true,
  className = "" 
}) => {
  return (
    <svg 
      viewBox="0 0 400 400" 
      width={size} 
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Définition du dégradé radial pour les barres */}
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f104a6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ff56c9', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Dégradé alternatif pour variation */}
        <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#851b64', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f104a6', stopOpacity: 1 }} />
        </linearGradient>
        
        <style>
          {`
            .rotating-bars-inner {
              animation: rotate 10s linear infinite;
              transform-origin: 200px 200px;
            }

            .rotating-bars-outer {
              animation: rotate 10s linear infinite;
              transform-origin: 200px 200px;
            }
            
            .inner-bar {
              animation: radialMove 3s ease-in-out infinite;
            }
            
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            @keyframes radialMove {
              0% { transform: translateY(0); }
              50% { transform: translateY(35px); }
              100% { transform: translateY(0); }
            }
            
            .logo-text {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-weight: 700;
              letter-spacing: 3px;
              fill: #f104a6;
            }
          `}
        </style>
      </defs>
      
      {/* Groupe des barres intérieures avec rotation */}
      <g className="rotating-bars-inner">
        <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        <g transform="rotate(30 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(60 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(90 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(120 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(150 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(180 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(210 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(240 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(270 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(300 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
        <g transform="rotate(330 200 200)">
          <rect x="195" y="100" width="10" height="50" fill="url(#barGradient)" className="inner-bar" />
        </g>
      </g>
      
      {/* Groupe des barres extérieures avec rotation */}
      <g className="rotating-bars-outer">
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(15 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(45 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(75 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(105 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(135 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(165 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(195 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(225 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(255 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(285 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(315 200 200)" />
        <rect x="195" y="80" width="10" height="50" fill="url(#barGradient2)" transform="rotate(345 200 200)" />
      </g>
      
      {/* Texte PANOPTIQUE - affiché seulement si showText est true */}
      {showText && (
        <text x="200" y="350" className="logo-text" textAnchor="middle" fontSize="20">
          PANOPTIQUE
        </text>
      )}
    </svg>
  );
};