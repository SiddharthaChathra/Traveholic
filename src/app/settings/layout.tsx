'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [globalMousePos, setGlobalMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setGlobalMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-gradient)', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading...
      </div>
    );
  }

  // Sidebar navigation options
  const sidebarItems = [
    { id: 'home', label: 'Home', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" fill={fill ? 'var(--right-pane-bg)' : 'none'} />
      </svg>
    ), href: '/?tab=home' },
    { id: 'search', label: 'Search', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ), href: '/?tab=search' },
    { id: 'reels', label: 'Reels', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="6" />
        <circle cx="12" cy="12" r="6" />
        <polygon points="10.5 9, 10.5 15, 15.5 12" fill="none" />
      </svg>
    ), href: '/?tab=reels' },
    { id: 'live', label: 'Live', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
      </svg>
    ), href: '/?tab=live' },
    { id: 'messages', label: 'Messages', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ), href: '/?tab=messages' },
    { id: 'create', label: 'Create', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ), href: '/?tab=create' },
    { id: 'trip-planner', label: 'Trip Planner', icon: (fill: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ), href: '/trip-planner' },
    { id: 'profile', label: 'Profile', icon: (fill: boolean) => (
      <img 
        src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'Traveler')}`} 
        alt="Profile" 
        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--card-border)' }} 
      />
    ), href: '/?tab=profile' }
  ];

  return (
    <div className="instagram-app-layout">
      {/* Background Ambient Glows */}
      <div className="bg-glow-container">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        
        {/* Cursor-reactive ambient background glow */}
        <div 
          className="global-cursor-reactive-glow"
          style={{
            left: `${globalMousePos.x}px`,
            top: `${globalMousePos.y}px`
          }}
        />
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        
        {/* SIDEBAR */}
        <div className="instagram-sidebar-wrapper">
          <aside 
            className="instagram-sidebar"
            onMouseLeave={() => setShowMoreMenu(false)}
          >
            <div className="instagram-sidebar-logo-container" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
              <span className="instagram-sidebar-logo-icon">
                <Logo theme={theme} width={26} showText={false} />
              </span>
              <span className="instagram-sidebar-logo-text">Travora</span>
            </div>

            <nav className="instagram-sidebar-menu">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  className="instagram-sidebar-item"
                  onClick={() => router.push(item.href)}
                >
                  <span className="instagram-sidebar-item-icon">
                    {item.icon(false)}
                  </span>
                  <span className="instagram-sidebar-item-label">{item.label}</span>
                </button>
              ))}

              {user.role === 'business' && (
                <button 
                  className="instagram-sidebar-item"
                  onClick={() => {
                    localStorage.removeItem('user_view_mode');
                    router.push('/venture/dashboard');
                  }}
                  style={{
                    background: 'var(--brand-gradient)',
                    color: 'white',
                    borderRadius: '8px',
                    marginTop: '12px'
                  }}
                >
                  <span className="instagram-sidebar-item-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" />
                      <rect x="14" y="3" width="7" height="5" />
                      <rect x="14" y="12" width="7" height="9" />
                      <rect x="3" y="16" width="7" height="5" />
                    </svg>
                  </span>
                  <span className="instagram-sidebar-item-label" style={{ fontWeight: 700 }}>Venture Dashboard</span>
                </button>
              )}
            </nav>

            <div className="instagram-sidebar-footer" style={{ position: 'relative' }}>
              {showMoreMenu && (
                <div className="instagram-more-menu-dropdown" style={{ bottom: '100%', left: '0', marginBottom: '8px' }}>
                  <button className="instagram-more-menu-item" onClick={() => { router.push('/settings'); setShowMoreMenu(false); }}>
                    <span>⚙️</span> Settings
                  </button>
                  <button className="instagram-more-menu-item" onClick={() => { router.push('/?tab=home'); setShowMoreMenu(false); }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                      <img src="/ai-guide.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
                    </span>
                    AI Guide
                  </button>
                  <button className="instagram-more-menu-item" onClick={() => { toggleTheme(); setShowMoreMenu(false); }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                      <img src="/theme-switcher.png" alt="Theme" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </span>
                    Switch Appearance
                  </button>
                  <div style={{ height: '1px', background: 'var(--card-border)', margin: '4px 0' }} />
                  <button className="instagram-more-menu-item" style={{ color: '#ef4444' }} onClick={() => { logout(); setShowMoreMenu(false); }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                      <img src="/logout-icon.png" alt="Log Out" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'invert(37%) sepia(93%) saturate(3025%) hue-rotate(338deg) brightness(96%) contrast(98%)' }} />
                    </span>
                    Log Out
                  </button>
                </div>
              )}

              <button 
                className={`instagram-sidebar-item ${showMoreMenu ? 'active' : ''}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">More</span>
              </button>
            </div>
          </aside>
        </div>

        {/* MAIN WORKSPACE CONTENT PANE */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Inner content display area */}
          <main style={{ flex: 1, padding: '40px 24px', overflowY: 'auto', zIndex: 10 }}>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <AnimatePresence>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                  style={{ width: '100%' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
