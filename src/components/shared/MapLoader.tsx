import React from 'react';

export default function MapLoader() {
  return (
    <div 
      className="discover-premium-card" 
      style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: '16px', 
        background: '#09080f', 
        border: '1px solid var(--card-border)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '550px',
        width: '100%'
      }}
    >
      {/* Grid background placeholder */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.8 }} />
      
      {/* Shimmer pulse animation */}
      <div className="skeleton-loader-shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-gradient)', opacity: 0.8, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
      </div>

      <span style={{ marginTop: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', zIndex: 2, letterSpacing: '1px', textTransform: 'uppercase' }}>
        Initializing Travora Maps...
      </span>

      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
