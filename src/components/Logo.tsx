import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
  width?: number | string;
  height?: number | string;
  showText?: boolean;
}

export default function Logo({ theme = 'light', width = 160, showText = false }: LogoProps) {
  const isDark = theme === 'dark';
  const logoSrc = isDark ? '/logo-dark.png' : '/logo-light.png';
  const aspectRatio = isDark ? '795 / 684' : '406 / 482';
  
  return (
    <div 
      className={`logo-container ${theme}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '2px'
      }}
    >
      <div 
        className="logo-wrapper" 
        style={{ 
          width, 
          aspectRatio,
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'visible'
        }}
      >
        <img 
          src={logoSrc} 
          alt="Travora Logo" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            display: 'block'
          }} 
        />
      </div>
      {showText && (
        <div 
          className="logo-text-block" 
          style={{ 
            textAlign: 'center', 
            marginTop: isDark ? '0px' : '-14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          <div 
            className="logo-brand-name" 
            style={{ 
              fontFamily: "var(--font-title)", 
              fontWeight: 800, 
              fontSize: '20px', 
              letterSpacing: '-0.04em', 
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}
          >
            Travora
          </div>
          <div 
            className="logo-tagline" 
            style={{ 
              fontFamily: "var(--font-body)", 
              fontSize: '5.5px', 
              fontWeight: 800, 
              letterSpacing: '0.12em', 
              textTransform: 'uppercase',
              display: 'flex',
              gap: '4px',
              justifyContent: 'center',
              lineHeight: 1
            }}
          >
            <span style={{ color: '#2a9d8f' }}>EXPLORE.</span>
            <span style={{ color: '#f4a261' }}>CONNECT.</span>
            <span style={{ color: '#e76f51' }}>INSPIRE.</span>
          </div>
        </div>
      )}
    </div>
  );
}
