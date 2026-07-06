'use client';

import React from 'react';
import VentureSidebar from '@/components/venture/VentureSidebar';
import Link from 'next/link';

export default function VentureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="instagram-container" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-gradient)' }}>
      {/* Spacer to match fixed width sidebar */}
      <div className="instagram-left-pane" style={{ width: '72px', flexShrink: 0 }} />
      
      {/* Sidebar */}
      <VentureSidebar />

      {/* Main content pane */}
      <div className="instagram-right-pane" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar panel */}
        <header style={{
          height: '64px',
          padding: '0 24px',
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(13, 17, 28, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Top Bar Left: Business Profiler */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Grand Plaza Resorts &amp; Spa
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Partner
            </span>
            
            {/* Trust Score badge */}
            <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} className="group">
              <span style={{
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-secondary)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                Trust Score: 98%
              </span>
            </div>
          </div>

          {/* Top Bar Right: Notifications & Traveler Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Toggle switch to traveler platform */}
            <Link 
              href="/"
              style={{
                textDecoration: 'none',
                background: 'var(--brand-gradient)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(236,72,153,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Switch to Traveler View
            </Link>

            {/* Notification triggers */}
            <button style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--primary)',
                boxShadow: '0 0 6px var(--primary)'
              }} />
            </button>

            {/* Profile Avatar */}
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=80&auto=format&fit=crop&q=80" 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </header>

        {/* Content body pane */}
        <main style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
