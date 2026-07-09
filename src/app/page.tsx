'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MapLoader from '@/components/shared/MapLoader';
import FollowButton from '@/components/shared/FollowButton';

const InteractiveMap = dynamic(() => import('@/components/shared/InteractiveMap'), {
  ssr: false,
  loading: () => <MapLoader />
});

interface HighlightStoryModalProps {
  selectedHighlight: string;
  setSelectedHighlight: (id: string | null) => void;
  activeStoryIdx: number;
  setActiveStoryIdx: React.Dispatch<React.SetStateAction<number>>;
  storyTimerProgress: number;
  storyImageLoaded: boolean;
  setStoryImageLoaded: (loaded: boolean) => void;
  highlights: any[];
  user: any;
  renderAvatar: (username: string, size?: number) => React.ReactNode;
}

function HighlightStoryModal({
  selectedHighlight,
  setSelectedHighlight,
  activeStoryIdx,
  setActiveStoryIdx,
  storyTimerProgress,
  storyImageLoaded,
  setStoryImageLoaded,
  highlights,
  user,
  renderAvatar
}: HighlightStoryModalProps) {
  const hl = highlights.find(h => h.id === selectedHighlight);
  if (!hl) return null;
  const currentStory = hl.stories[activeStoryIdx % hl.stories.length];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="highlight-stories-modal-overlay"
      onClick={() => setSelectedHighlight(null)}
    >
      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="highlight-stories-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Progress Segment indicators */}
        <div className="story-progress-segments-bar">
          {hl.stories.map((s: any, idx: number) => {
            const isCompleted = idx < activeStoryIdx;
            const isActive = idx === activeStoryIdx;
            const fillWidth = isCompleted ? '100%' : isActive ? `${storyTimerProgress}%` : '0%';
            
            return (
              <div key={idx} className="story-progress-bar-track">
                <div 
                  className="story-progress-bar-fill-indicator"
                  style={{ 
                    width: fillWidth,
                    background: 'white',
                    height: '100%',
                    borderRadius: '4px',
                    transition: isActive ? 'none' : 'width 0.1s linear'
                  }} 
                />
              </div>
            );
          })}
        </div>

        <div className="story-viewer-top-row">
          <div className="story-creator-avatar">
            {renderAvatar(user.username, 30)}
          </div>
          <span className="story-creator-username">{user.username}</span>
          <span className="story-topic-badge">{hl.title}</span>
          <button 
            type="button"
            className="story-viewer-close-btn"
            onClick={() => setSelectedHighlight(null)}
          >
            &times;
          </button>
        </div>

        <div className="story-viewer-image-pane">
          {/* Tap Navigation Zones Overlay */}
          <div className="story-navigation-zones">
            <div className="story-nav-zone left-zone" onClick={(e) => {
              e.stopPropagation();
              if (activeStoryIdx > 0) {
                setActiveStoryIdx(prev => prev - 1);
              } else {
                setActiveStoryIdx(hl.stories.length - 1);
              }
            }} />
            <div className="story-nav-zone right-zone" onClick={(e) => {
              e.stopPropagation();
              if (activeStoryIdx < hl.stories.length - 1) {
                setActiveStoryIdx(prev => prev + 1);
              } else {
                setSelectedHighlight(null);
              }
            }} />
          </div>

          <img 
            src={currentStory.img} 
            alt={currentStory.caption} 
            className="story-viewer-img" 
            onLoad={() => setStoryImageLoaded(true)}
            style={{ 
              opacity: storyImageLoaded ? 1 : 0, 
              filter: storyImageLoaded ? 'blur(0)' : 'blur(10px)',
              transition: 'opacity 0.25s ease-out, filter 0.25s ease-out' 
            }}
          />
          <div className="story-viewer-caption-badge">
            {currentStory.caption}
          </div>
        </div>

        {hl.stories.length > 1 && (
          <>
            <button 
              type="button"
              className="story-nav-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStoryIdx(prev => (prev - 1 + hl.stories.length) % hl.stories.length);
              }}
            >
              &#10094;
            </button>
            <button 
              type="button"
              className="story-nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStoryIdx(prev => (prev + 1) % hl.stories.length);
              }}
            >
              &#10095;
            </button>
          </>
        )}

      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, login, signup, logout, updateTravellerType, forgotPassword, verifyOtp, resetPassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'business') {
        const viewMode = localStorage.getItem('user_view_mode');
        if (viewMode !== 'traveller') {
          router.push('/venture/dashboard');
        }
      }
    }
  }, [user, loading, router]);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  };

  const renderAvatar = (username: string, size = 40) => {
    if (!username) return null;
    const cleanName = username.startsWith('@') ? username.slice(1) : username;
    const initials = cleanName.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    const gradients = [
      'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
    ];
    
    const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradient = gradients[hash % gradients.length];
    
    return (
      <div 
        className="premium-avatar" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderRadius: '50%', 
          background: gradient, 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: `${size * 0.38}px`, 
          fontWeight: 700,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
          border: '1.5px solid var(--glass-border)',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          flexShrink: 0
        }}
      >
        {initials}
      </div>
    );
  };

  const renderMilestoneIcon = (id: string, size = 58) => {
    // Multi-gradient medallion definitions for embossed/metallic finishes
    const svgDefs = (
      <defs>
        {/* Metal ring gradients */}
        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe082" />
          <stop offset="30%" stopColor="#ffb300" />
          <stop offset="70%" stopColor="#ff8f00" />
          <stop offset="100%" stopColor="#ff6f00" />
        </linearGradient>
        <linearGradient id="silverRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="bronzeRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="40%" stopColor="#ca8a04" />
          <stop offset="75%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
        <linearGradient id="cosmicRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="tealRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Medallion face radial backgrounds */}
        <radialGradient id="goldFace" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Embossed Drop shadow filter */}
        <filter id="embossShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>
    );

    const renderMedallionWrapper = (gradientId: string, children: React.ReactNode) => (
      <svg width={size} height={size} viewBox="0 0 80 80" className="medallion-svg">
        {svgDefs}
        {/* Embossed outer metal ring */}
        <circle cx="40" cy="40" r="37" fill="none" stroke={`url(#${gradientId})`} strokeWidth="4.5" filter="url(#embossShadow)" />
        {/* Medallion core face */}
        <circle cx="40" cy="40" r="35" fill="url(#goldFace)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {/* Subtle inner radial glow rim */}
        <circle cx="40" cy="40" r="33.5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="0.75" opacity="0.35" />
        {children}
      </svg>
    );

    switch (id) {
      case 'ms-1': // First Flight
        return renderMedallionWrapper('goldRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#goldRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Speed trails */}
            <path d="M2 19h4M1 15h6M3 11h3" strokeWidth="1" opacity="0.5" />
            {/* Embossed airplane outline */}
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z" fill="rgba(251, 191, 36, 0.08)" />
          </g>
        ));

      case 'ms-2': // Mountain Conqueror
        return renderMedallionWrapper('silverRing', (
          <g transform="translate(20, 20) scale(1.65)" stroke="url(#silverRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Peaks */}
            <path d="M3 20l8-14 8 14H3z" fill="rgba(148, 163, 184, 0.08)" />
            <path d="M12 20l5-9 4 9H12z" />
            <path d="M1 20l6-10 5 10H1z" opacity="0.6" />
            {/* Snow caps */}
            <path d="M9 10.5l2-3.5 2 3.5-1 1-1-1z" fill="currentColor" />
            {/* Winding trail */}
            <path d="M11 20c-1.5-2-1-3 1-5s0.5-3-1-4.5" stroke="#3b82f6" strokeWidth="1.5" />
          </g>
        ));

      case 'ms-3': // Tropical Nomad
        return renderMedallionWrapper('bronzeRing', (
          <g transform="translate(20, 20) scale(1.65)" stroke="url(#bronzeRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Sunset sphere background */}
            <circle cx="12" cy="12" r="9" stroke="none" fill="rgba(234, 88, 12, 0.08)" />
            {/* Compass rose ticks */}
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            {/* Palm tree */}
            <path d="M12 21c-2-3-2-7 1-10" strokeWidth="1.5" />
            <path d="M13 11c-2-1.5-4-0.5-5 1.5M13 11c-1-2.5-3-2.5-4-1M13 11c0-2.5 2-3 3.5-2.5M13 11c1-1.5 3-1 4.5 0.5" />
            {/* Ocean waves */}
            <path d="M6 19h12" stroke="#10b981" strokeWidth="1" />
            <path d="M8 21h8" stroke="#10b981" strokeWidth="0.8" />
          </g>
        ));

      case 'ms-4': // Globetrotter Pro
        return renderMedallionWrapper('cosmicRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#cosmicRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Globe latitude/longitude */}
            <circle cx="12" cy="12" r="9" fill="rgba(168, 85, 247, 0.08)" />
            <path d="M3 12h18" />
            <path d="M12 3v18" />
            <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
            {/* Orbital path lines */}
            <ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(-30 12 12)" stroke="#ec4899" strokeWidth="0.8" strokeDasharray="3 2" />
            <ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(40 12 12)" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="3 2" />
          </g>
        ));

      case 'ms-5': // Storyteller Master
        return renderMedallionWrapper('cosmicRing', (
          <g transform="translate(20, 20) scale(1.65)" stroke="url(#cosmicRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Embossed camera structure */}
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="rgba(244, 63, 94, 0.08)" />
            {/* Lens aperture ring */}
            <circle cx="12" cy="13" r="5" />
            <circle cx="12" cy="13" r="2.5" fill="currentColor" />
            {/* Flash bulb */}
            <circle cx="18" cy="9" r="1.2" fill="currentColor" />
          </g>
        ));

      case 'ms-6': // Passport Stamped
        return renderMedallionWrapper('tealRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#tealRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Passport booklet background */}
            <rect x="4" y="3" width="11" height="15" rx="1.5" fill="rgba(6, 182, 212, 0.08)" />
            {/* Embossed booklet lines */}
            <line x1="7" y1="6" x2="12" y2="6" />
            <line x1="7" y1="10" x2="12" y2="10" />
            {/* Stamped star silhouette */}
            <polygon points="17 9 19 12 22 10 20 7" fill="rgba(22, 211, 238, 0.3)" />
            <circle cx="18.5" cy="9.5" r="3.5" stroke="#0891b2" strokeWidth="1" />
          </g>
        ));

      case 'ms-7': // Night Owl Explorer
        return renderMedallionWrapper('silverRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#silverRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* City skyline at night */}
            <path d="M2 20h20v-3h-2v-4h-3v4h-2V9h-3v7h-2v-5H5v9z" fill="rgba(148, 163, 184, 0.08)" />
            {/* Crescent moon outline */}
            <path d="M12 2A7.5 7.5 0 0 0 19.5 9.5a7.5 7.5 0 0 1-7.5-7.5z" stroke="#cbd5e1" strokeWidth="1.5" fill="#f1f5f9" />
            {/* Stars */}
            <circle cx="5" cy="5" r="0.5" fill="#cbd5e1" />
            <circle cx="9" cy="3" r="0.5" fill="#cbd5e1" />
          </g>
        ));

      case 'ms-8': // Local Favorite
        return renderMedallionWrapper('cosmicRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#cosmicRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Map pin */}
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="rgba(244, 63, 94, 0.08)" />
            {/* Heart shape center */}
            <path d="M12 7.6c-0.8-1-2.2-1.3-3.2-0.5s-1.2 2.3-0.2 3.3l3.4 3.4 3.4-3.4c1-1 0.8-2.5-0.2-3.3s-2.4-0.5-3.2 0.5z" fill="#ec4899" />
            {/* Local concentric ring ticks */}
            <circle cx="12" cy="10" r="7" strokeDasharray="3 3" opacity="0.6" />
          </g>
        ));

      case 'ms-9': // Streak Keeper
        return renderMedallionWrapper('goldRing', (
          <g transform="translate(20, 20) scale(1.65)" stroke="url(#goldRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Calendar backing */}
            <rect x="3" y="5" width="18" height="15" rx="2" fill="rgba(249, 115, 22, 0.08)" />
            <line x1="3" y1="10" x2="21" y2="10" />
            {/* Calendar grid dots */}
            <circle cx="7" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="17" cy="14" r="1" fill="currentColor" />
            {/* Embossed Flame */}
            <path d="M12 2c3.5 3.5 3.5 7 0 9.5-3-2-3-5.5 0-9.5z" stroke="#f97316" strokeWidth="1.5" fill="#f97316" />
          </g>
        ));

      case 'ms-10': // Hidden Gem Hunter
        return renderMedallionWrapper('tealRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#tealRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Sparkling Diamond */}
            <polygon points="12 3 17 8 12 16 7 8" fill="rgba(20, 184, 166, 0.2)" stroke="#14b8a6" />
            <line x1="7" y1="8" x2="17" y2="8" />
            <line x1="12" y1="3" x2="12" y2="16" />
            {/* Magnifying glass frame */}
            <circle cx="14" cy="10" r="7" stroke="#0d9488" strokeWidth="1.5" />
            <line x1="19" y1="15" x2="23" y2="19" stroke="#0d9488" strokeWidth="2.5" />
          </g>
        ));

      case 'ms-11': // Community Builder
        return renderMedallionWrapper('bronzeRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#bronzeRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Trophy shape from nodes */}
            <path d="M6 9h12v4a6 6 0 0 1-12 0V9z" fill="rgba(132, 204, 22, 0.08)" />
            <path d="M12 15v4m-4 2h8" />
            {/* Network user nodes surrounding trophy */}
            <circle cx="5" cy="7" r="1.5" fill="currentColor" />
            <circle cx="19" cy="7" r="1.5" fill="currentColor" />
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <line x1="5" y1="7" x2="12" y2="5" />
            <line x1="19" y1="7" x2="12" y2="5" />
          </g>
        ));

      case 'ms-12': // Road Warrior
        return renderMedallionWrapper('cosmicRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#cosmicRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Shield backer */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(99, 102, 241, 0.08)" />
            {/* Perspective Winding Road */}
            <path d="M12 4l-4 14h8l-4-14z" />
            <path d="M12 4v14" stroke="#6366f1" strokeDasharray="2 2" strokeWidth="1.5" />
          </g>
        ));

      case 'ms-13': // Culture Seeker
        return renderMedallionWrapper('cosmicRing', (
          <g transform="translate(18, 18) scale(1.85)" stroke="url(#cosmicRing)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Three land landmarks (Pyramids, Torii, Column) */}
            {/* Pyramids */}
            <polygon points="2 18 6 10 11 18" fill="rgba(236, 72, 153, 0.1)" />
            {/* Torii Gate */}
            <path d="M14 18v-7h6v7m-8-5h10M12 11h10" strokeWidth="1.5" />
            {/* Roman column */}
            <line x1="12" y1="7" x2="12" y2="18" strokeWidth="2.5" />
            <line x1="10" y1="7" x2="14" y2="7" />
          </g>
        ));

      default:
        return renderMedallionWrapper('silverRing', (
          <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        ));
    }
  };


  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [fadeClass, setFadeClass] = useState('');
  const [contentVisible, setContentVisible] = useState(false);

  // Form Switch States
  const [formMode, setFormMode] = useState<'login' | 'signup'>('login');
  const [userRole, setUserRole] = useState<'traveller' | 'business'>('traveller');
  const [showPassword, setShowPassword] = useState(false);

  // Input states (Common)
  const [identifier, setIdentifier] = useState(''); // email or username for login
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Birthday Selects
  const [birthMonth, setBirthMonth] = useState('Month');
  const [birthDay, setBirthDay] = useState('Day');
  const [birthYear, setBirthYear] = useState('Year');

  // Traveller Specific Inputs
  const [isVlogger, setIsVlogger] = useState(false);

  // Business Specific Inputs
  const [businessType, setBusinessType] = useState<'agency' | 'hotel'>('agency');
  const [businessName, setBusinessName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bookingModel, setBookingModel] = useState<'direct' | 'redirect'>('direct');

  // Form UI Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // Premium Social Feed States
  // ==========================================
  const [activeTab, setActiveTab] = useState<'home' | 'reels' | 'search' | 'create' | 'messages' | 'profile' | 'live' | 'live-studio' | 'live-dashboard'>('home');

  // Map interaction states
  const [hoveredDestinationName, setHoveredDestinationName] = useState<string | null>(null);
  const [selectedDestinationName, setSelectedDestinationName] = useState<string | null>(null);
  const [visibleDestinationNames, setVisibleDestinationNames] = useState<string[]>([]);

  // ==========================================
  // ==========================================
  // Live Streaming (Discovery + Studio) States
  // ==========================================
  const [liveCategory, setLiveCategory] = useState('All');
  const [liveGridCategory, setLiveGridCategory] = useState('All');
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [isLiveSwitchingCategory, setIsLiveSwitchingCategory] = useState(false);
  const [hasEverSwitchedLiveCategory, setHasEverSwitchedLiveCategory] = useState(false);
  const [hasLiveCreators, setHasLiveCreators] = useState(true);
  const [activeStreams, setActiveStreams] = useState([
    {
      id: 'stream-1',
      username: 'nomad_vlogs',
      fullName: 'Alex Nomad',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      title: 'Live Trekking to Hidden Waterfalls in Bali! 🎒💦',
      category: 'IRL',
      viewers: 21500,
      likes: 12400,
      isMuted: true,
      isVerified: true,
      isFollowed: true,
      thumbnail: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
      isHovered: false
    },
    {
      id: 'stream-2',
      username: 'backpack_sam',
      fullName: 'Sam Backpacker',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      title: 'Manali Cold Campfire Q&A! Ask me anything 🏔️🔥',
      category: 'Q&A',
      viewers: 8900,
      likes: 4500,
      isMuted: true,
      isVerified: false,
      isFollowed: false,
      thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
      isHovered: false
    },
    {
      id: 'stream-3',
      username: 'wanderlust_jenny',
      fullName: 'Jenny Wanderlust',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      title: 'Exploring Kyoto Bamboo Forest at Dawn! ⛩️🎋',
      category: 'Adventure',
      viewers: 14200,
      likes: 8200,
      isMuted: true,
      isVerified: true,
      isFollowed: true,
      thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
      isHovered: false
    },
    {
      id: 'stream-4',
      username: 'culture_seeker',
      fullName: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      title: 'Behind the Scenes at Rome Colosseum! 🏛️🇮🇹',
      category: 'Behind the Scenes',
      viewers: 6400,
      likes: 3100,
      isMuted: true,
      isVerified: false,
      isFollowed: false,
      thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80',
      isHovered: false
    }
  ]);

  // Go Live Studio wizard states
  const [createChoice, setCreateChoice] = useState<'none' | 'post' | 'live'>('none');
  const [liveStep, setLiveStep] = useState(1);
  
  // Step 1
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [liveSelectedCategories, setLiveSelectedCategories] = useState<string[]>(['IRL']);
  
  // Step 2
  const [liveThumbnail, setLiveThumbnail] = useState<string>('');
  const [liveSource, setLiveSource] = useState<'webcam' | 'encoder'>('webcam');
  const [streamUrl, setStreamUrl] = useState('rtmp://live.travora.com/app');
  const [streamKey, setStreamKey] = useState('live_usr_7392a8e10c7b41e9b283d7265');
  const [isKeyRevealed, setIsKeyRevealed] = useState(false);
  
  // Step 3
  const [liveVisibility, setLiveVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [allowLiveComments, setAllowLiveComments] = useState(true);
  const [liveChatModeration, setLiveChatModeration] = useState(true);
  const [notifyFollowers, setNotifyFollowers] = useState(true);
  const [saveRecording, setSaveRecording] = useState(true);
  const [liveCoppaToggle, setLiveCoppaToggle] = useState(false);

  // Live Stream Dashboard States
  const [streamStatus, setStreamStatus] = useState<'connecting' | 'live' | 'nodata'>('connecting');
  const [dashboardTab, setDashboardTab] = useState<'settings' | 'analytics' | 'health'>('settings');
  const [liveChatInput, setLiveChatInput] = useState('');
  const [liveChatMessages, setLiveChatMessages] = useState([
    { id: '1', username: 'adventure_mike', text: 'Stunning view, where is this exactly?', timestamp: '20:46' },
    { id: '2', username: 'flora_explores', text: 'Can you show the camera gear you are using?', timestamp: '20:46' },
    { id: '3', username: 'nomad_vlogs', text: 'This looks so smooth! High quality stream.', timestamp: '20:47' },
    { id: '4', username: 'backpacker_sam', text: 'Awesome connection speed.', timestamp: '20:47' }
  ]);
  const [liveModerationMenuOpen, setLiveModerationMenuOpen] = useState(false);
  const [liveShowTipBanner, setLiveShowTipBanner] = useState(true);
  
  // Count-up states for active dashboard
  const [dashboardViewers, setDashboardViewers] = useState(0);
  const [dashboardLikes, setDashboardLikes] = useState(0);
  const [dashboardChatRate, setDashboardChatRate] = useState(0);
  const [isMiniInboxOpen, setIsMiniInboxOpen] = useState(false);
  const [isExpandingFullscreen, setIsExpandingFullscreen] = useState(false);
  const [miniSlideActive, setMiniSlideActive] = useState(false);
  const [miniActiveChatBuddy, setMiniActiveChatBuddy] = useState<string | null>(null);
  const [miniChatInput, setMiniChatInput] = useState('');
  const [miniSearchQuery, setMiniSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExploreCategory, setActiveExploreCategory] = useState('All');
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [hasEverSwitchedCategory, setHasEverSwitchedCategory] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'following' | 'comments' | 'follows'>('all');

  // Dynamic system time for mobile device status bar
  const [systemTime, setSystemTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const formattedHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      setSystemTime(`${formattedHours}:${minutes}`);
    };
    updateTime();

    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let intervalId: NodeJS.Timeout;
    const timeoutId = setTimeout(() => {
      updateTime();
      intervalId = setInterval(updateTime, 60000);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);



  // Liquid Indicator Refs and Position States
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    left: 0,
    width: 0,
    opacity: 0,
    transform: 'scale(1)',
  });

  useEffect(() => {
    if (!showNotificationsDrawer || !filterBarRef.current) return;
    
    const timer = setTimeout(() => {
      const container = filterBarRef.current;
      if (!container) return;
      
      const activeBtn = container.querySelector('.notification-filter-btn.active') as HTMLButtonElement;
      if (!activeBtn) return;
      
      const prevLeft = parseFloat(container.dataset.indicatorLeft || '0');
      const prevWidth = parseFloat(container.dataset.indicatorWidth || '0');
      
      const currentLeft = activeBtn.offsetLeft;
      const currentWidth = activeBtn.offsetWidth;
      
      if (prevWidth > 0 && Math.abs(currentLeft - prevLeft) > 5) {
        // Organic liquid stretching bounding box
        const combinedLeft = Math.min(prevLeft, currentLeft);
        const combinedRight = Math.max(prevLeft + prevWidth, currentLeft + currentWidth);
        const combinedWidth = combinedRight - combinedLeft;
        
        // Slightly squish vertically and stretch horizontally for liquid distortion
        setIndicatorStyle({
          left: combinedLeft,
          width: combinedWidth,
          opacity: 1,
          transform: 'scaleY(0.92) scaleX(1.02)',
        });
        
        const snapTimer = setTimeout(() => {
          setIndicatorStyle({
            left: currentLeft,
            width: currentWidth,
            opacity: 1,
            transform: 'scale(1)',
          });
          container.dataset.indicatorLeft = String(currentLeft);
          container.dataset.indicatorWidth = String(currentWidth);
        }, 120);
        
        return () => clearTimeout(snapTimer);
      } else {
        setIndicatorStyle({
          left: currentLeft,
          width: currentWidth,
          opacity: 1,
          transform: 'scale(1)',
        });
        container.dataset.indicatorLeft = String(currentLeft);
        container.dataset.indicatorWidth = String(currentWidth);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [notificationFilter, showNotificationsDrawer]);

  // Explore Category Liquid Indicator Refs and Position States
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategoryStyle, setActiveCategoryStyle] = useState<React.CSSProperties>({
    left: 0,
    width: 0,
    opacity: 0,
    transform: 'scale(1)',
  });
  const [scalingActiveBtn, setScalingActiveBtn] = useState<string | null>(null);

  useEffect(() => {
    if (!categoriesContainerRef.current) return;
    
    const container = categoriesContainerRef.current;
    
    const timer = setTimeout(() => {
      const activeBtn = container.querySelector('.explore-category-btn.active') as HTMLButtonElement;
      if (!activeBtn) return;
      
      const prevLeft = parseFloat(container.dataset.indicatorLeft || '0');
      const prevWidth = parseFloat(container.dataset.indicatorWidth || '0');
      
      const currentLeft = activeBtn.offsetLeft;
      const currentWidth = activeBtn.offsetWidth;
      
      setScalingActiveBtn(activeExploreCategory);
      const bumpTimer = setTimeout(() => {
        setScalingActiveBtn(null);
      }, 300);
      
      if (prevWidth > 0 && Math.abs(currentLeft - prevLeft) > 5) {
        // Stretch indicator to cover start to end bounds
        const combinedLeft = Math.min(prevLeft, currentLeft);
        const combinedRight = Math.max(prevLeft + prevWidth, currentLeft + currentWidth);
        const combinedWidth = combinedRight - combinedLeft;
        
        setActiveCategoryStyle({
          left: combinedLeft,
          width: combinedWidth,
          opacity: 1,
          transform: 'scaleY(0.94) scaleX(1.025)',
        });
        
        const snapTimer = setTimeout(() => {
          setActiveCategoryStyle({
            left: currentLeft,
            width: currentWidth,
            opacity: 1,
            transform: 'scale(1)',
          });
          container.dataset.indicatorLeft = String(currentLeft);
          container.dataset.indicatorWidth = String(currentWidth);
        }, 110);
        
        return () => {
          clearTimeout(bumpTimer);
          clearTimeout(snapTimer);
        };
      } else {
        setActiveCategoryStyle({
          left: currentLeft,
          width: currentWidth,
          opacity: 1,
          transform: 'scale(1)',
        });
        container.dataset.indicatorLeft = String(currentLeft);
        container.dataset.indicatorWidth = String(currentWidth);
        return () => clearTimeout(bumpTimer);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [activeExploreCategory, activeTab]);
  
  // Dedicated Vlogs Feed state
  const [vlogs, setVlogs] = useState([
    {
      id: 'vlog-1',
      username: 'nomad_alex',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      location: 'Leh-Ladakh 🏔️',
      title: 'Solo biking across the highest motorable road in Khardung La! 🏍️ Peak adventure vibes.',
      views: '42.8K views',
      likes: 1254,
      thumbnail: '/vlog-1.png',
      duration: '4:15',
      liked: false
    },
    {
      id: 'vlog-2',
      username: 'wanderlust_jenny',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      location: 'Seminyak, Bali 🌴',
      title: 'Top 5 secret beach cafes you must visit in Bali this year! 🍹🌴 Saved the best for last.',
      views: '89.2K views',
      likes: 3821,
      thumbnail: '/vlog-2.png',
      duration: '8:40',
      liked: false
    },
    {
      id: 'vlog-3',
      username: 'nomad_vlogs',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      location: 'Cappadocia, Turkey 🎈',
      title: 'Waking up at 5 AM to witness hundreds of hot air balloons fill the sky! Absolutely magical ✨',
      views: '112.5K views',
      likes: 5410,
      thumbnail: '/vlog-3.png',
      duration: '6:20',
      liked: false
    },
    {
      id: 'vlog-4',
      username: 'backpack_guide',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      location: 'Kyoto, Japan ⛩️',
      title: 'Exploring the quiet bamboo forests of Arashiyama in the early morning. Sound on 🔊',
      views: '61.4K views',
      likes: 2901,
      thumbnail: '/vlog-4.png',
      duration: '5:02',
      liked: false
    }
  ]);

  const toggleLikeVlog = (id: string) => {
    setVlogs((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            liked: !v.liked,
            likes: v.liked ? v.likes - 1 : v.likes + 1
          };
        }
        return v;
      })
    );
  };

  interface Post {
    id: string;
    username: string;
    avatar: string;
    location: string;
    images: string[];
    caption: string;
    hashtags: string[];
    likesCount: number;
    comments: { id: string; username: string; text: string }[];
    image?: string;
    title?: string;
    categories?: string[];
    platform?: string;
    scheduleDate?: string;
    scheduleTime?: string;
    visibility?: string;
    allowComments?: boolean;
  }

  // Custom posts list state
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      username: 'wanderlust_jenny',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      location: 'Ubud, Bali 🌴',
      images: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
      ],
      caption: 'Waking up to tropical jungle sounds in Bali... this place is absolute heaven! 💚 Who wants to join my next backpacking trip here?',
      hashtags: ['#bali', '#backpacking', '#nature', '#travelbuddy'],
      likesCount: 142,
      comments: [
        { id: 'c1', username: 'backpacker_sam', text: 'Stunning! I am planning to visit Ubud next month. Let’s connect!' },
        { id: 'c2', username: 'nomad_alex', text: 'Which villa is this? Looks incredible.' }
      ]
    },
    {
      id: 'post-2',
      username: 'backpacker_sam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      location: 'Solang Valley, Manali 🏔️',
      images: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
      ],
      caption: 'First summit climb of the year! The thin air, cold wind, and majestic views are worth every step. 🏔️ Solang Valley never ceases to amaze.',
      hashtags: ['#manali', '#climbing', '#adventure', '#mountains'],
      likesCount: 98,
      comments: [
        { id: 'c3', username: 'wanderlust_jenny', text: 'So proud of you Sam! Safe travels!' }
      ]
    },
    {
      id: 'post-3',
      username: 'stay_luxury_bali',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      location: 'Seminyak, Goa 🌊',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80'
      ],
      caption: 'Golden hour at our beachside resort. Private pool villas available direct. Link in bio! 🌅🍹',
      hashtags: ['#goa', '#luxuryresort', '#sunset', '#beachlife'],
      likesCount: 215,
      comments: [
        { id: 'c4', username: 'nomad_alex', text: 'Just booked a weekend stay here, can’t wait!' }
      ]
    }
  ]);

  // Stories list state
  const [stories, setStories] = useState([
    { id: 'story-1', username: 'Your Story', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=80', caption: 'Sunrise hike above the clouds! 🌅🧗‍♂️', viewed: false, isLive: false },
    { id: 'story-2', username: 'nomad_vlogs', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80', caption: 'LIVE STREAM: Hidden Waterfalls Trek! 💦🎥', viewed: false, isLive: true },
    { id: 'story-3', username: 'backpacker_sam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80', caption: 'Campfire talks in the freezing cold! 🪵🔥', viewed: false, isLive: false },
    { id: 'story-4', username: 'wanderlust_jenny', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80', caption: 'Scooter rides through Bali rice fields! 🛵🌾', viewed: false, isLive: false },
    { id: 'story-5', username: 'nomad_alex', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80', caption: 'Fresh croissants in Paris! 🥐🇫🇷', viewed: false, isLive: false }
  ]);

  // Active story viewing states
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', username: 'backpacker_sam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', type: 'like', text: 'liked your post.', time: '2m ago' },
    { id: 'n2', username: 'wanderlust_jenny', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', type: 'comment', text: 'commented: "Stunning shot!"', time: '15m ago' },
    { id: 'n3', username: 'nomad_alex', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', type: 'follow', text: 'started following you.', time: '1h ago' }
  ]);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Settings Drawer State
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // AI Chatbot States
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: 'ai', text: 'Hi! I’m your Travora AI assistant. Ask me anything about itineraries, local tips, or travel recommendations!' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Direct Inbox Messages States
  const [activeChatBuddy, setActiveChatBuddy] = useState('backpacker_sam');
  const [isSwitchingChat, setIsSwitchingChat] = useState(false);

  const handleSwitchActiveChat = (buddy: string) => {
    if (buddy === activeChatBuddy) return;
    setIsSwitchingChat(true);
    setTimeout(() => {
      setActiveChatBuddy(buddy);
      setIsSwitchingChat(false);
    }, 220);
  };

  const handleSwitchExploreCategory = (cat: string) => {
    if (cat === activeExploreCategory) return;
    
    // Play synthesized micro-sound click
    playUISound('click');
    
    // Dynamically update background mood glow color based on category
    let moodColor = 'rgba(139, 92, 246, 0.15)';
    if (cat === 'Mountains') moodColor = 'rgba(59, 130, 246, 0.15)';
    else if (cat === 'Beaches') moodColor = 'rgba(236, 72, 153, 0.15)';
    else if (cat === 'Tropical') moodColor = 'rgba(245, 158, 11, 0.15)';
    else if (cat === 'Cities') moodColor = 'rgba(16, 185, 129, 0.15)';
    else if (cat === 'Winter') moodColor = 'rgba(6, 182, 212, 0.15)';
    else if (cat === 'Cultural') moodColor = 'rgba(219, 39, 119, 0.15)';
    setCategoryMoodColor(moodColor);

    setHasEverSwitchedCategory(true);
    setIsSwitchingCategory(true);
    setTimeout(() => {
      setActiveExploreCategory(cat);
      setIsSwitchingCategory(false);
    }, 220);
  };

  const renderCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'All':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        );
      case 'Mountains':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
        );
      case 'Beaches':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3" />
            <path d="M2 14c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3" />
          </svg>
        );
      case 'Tropical':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Palm tree trunk */}
            <path d="M12 22V12" />
            {/* Left frond */}
            <path d="M12 12C12 12 6 10 4 5c2 1 5 2 8 7z" />
            {/* Right frond */}
            <path d="M12 12C12 12 18 10 20 5c-2 1-5 2-8 7z" />
            {/* Top frond */}
            <path d="M12 12C12 12 10 6 12 2c1 2 2 5 0 10z" />
            {/* Trunk curve */}
            <path d="M12 22c-1-4 2-7 3-10" />
          </svg>
        );
      case 'Cities':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20M4 22V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16M12 22V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12" />
          </svg>
        );
      case 'Winter':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4" />
          </svg>
        );
      case 'Cultural':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Temple / Pagoda icon */}
            <path d="M3 21h18" />
            <path d="M5 21V10l7-7 7 7v11" />
            <path d="M9 21v-6h6v6" />
            <path d="M2 10h20" />
            <path d="M6 10V7" />
            <path d="M18 10V7" />
          </svg>
        );
      default:
        return null;
    }
  };
  const [chatInput, setChatInput] = useState('');
  const [conversations, setConversations] = useState<Record<string, { sender: 'them' | 'me'; text: string; time: string }[]>>({
    'backpacker_sam': [
      { sender: 'them', text: 'Hey, are you going to Manali next week?', time: '10:30 AM' },
      { sender: 'me', text: 'Yes! Planning to stay near Solang Valley. How is the weather?', time: '10:32 AM' },
      { sender: 'them', text: 'It’s amazing right now, perfect for trekking! Bring a warm jacket.', time: '10:35 AM' }
    ],
    'wanderlust_jenny': [
      { sender: 'them', text: 'Loved your post! Bali was so magical.', time: 'Yesterday' },
      { sender: 'me', text: 'Thank you! Yes, Seminyak is a dream.', time: 'Yesterday' }
    ],
    'nomad_alex': [
      { sender: 'them', text: 'Do you recommend hostel stays or homestays in Goa?', time: '2 days ago' },
      { sender: 'me', text: 'Hostels are great for meeting people, homestays are better for peace.', time: '2 days ago' }
    ]
  });

  // Reels list data & interactions
  const [reels, setReels] = useState([
    {
      id: 'reel-1',
      username: 'nomad_vlogs',
      avatar: '🎥',
      caption: 'Exploring hidden waterfalls in Bali! 💦 Nature at its finest. #travelvlog #waterfalls #bali',
      soundtrack: 'Nomad Vlogs - Original Audio',
      likes: 1205,
      comments: 89,
      imageGradient: 'linear-gradient(to bottom, #0284c7, #8b5cf6, #ec4899)'
    },
    {
      id: 'reel-2',
      username: 'iceland_explorer',
      avatar: '🦊',
      caption: 'Chasing sunsets across the black sand beach in Iceland. 🌋🌊 #iceland #sunset #glacier',
      soundtrack: 'Iceland Explorer - Soundscapes',
      likes: 852,
      comments: 42,
      imageGradient: 'linear-gradient(to bottom, #111827, #1e3a8a, #0d9488)'
    },
    {
      id: 'reel-3',
      username: 'backpacker_sam',
      avatar: '🧗‍♂️',
      caption: 'Morning views from 4,000 meters above sea level! 🏔️☕ #mountains #hiking #camping #sunrise',
      soundtrack: 'Backpacker Sam - Morning Chill',
      likes: 1943,
      comments: 112,
      imageGradient: 'linear-gradient(to bottom, #b45309, #d97706, #10b981)'
    }
  ]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Advanced Interactive states for Reels
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set(['nomad_vlogs']));
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [refreshPoolIndex, setRefreshPoolIndex] = useState(0);

  // Pool of new reels to load on scroll-up refresh
  const refreshPool = [
    {
      id: 'reel-ref-1',
      username: 'travel_guru',
      avatar: '🌸',
      caption: 'Lost in the streets of Kyoto 🇯🇵. The cherry blossoms are breathtaking! #japan #kyoto #sakura',
      soundtrack: 'Travel Guru - Kyoto Lofi Beat',
      likes: 4521,
      comments: 230,
      imageGradient: 'linear-gradient(to bottom, #fbcfe8, #f472b6, #db2777)'
    },
    {
      id: 'reel-ref-2',
      username: 'surf_safari',
      avatar: '🏄‍♂️',
      caption: 'Catching waves at dawn in Costa Rica! 🌊☀️ Pure life vibes. #puravida #surfing #travelgoals',
      soundtrack: 'Surf Safari - Surf Rock Anthems',
      likes: 3120,
      comments: 115,
      imageGradient: 'linear-gradient(to bottom, #06b6d4, #0891b2, #0369a1)'
    },
    {
      id: 'reel-ref-3',
      username: 'aurora_hunter',
      avatar: '🌌',
      caption: 'The northern lights dancing in Norway! 🌌✨ Unbelievable night. #aurora #norway #travel #nightsky',
      soundtrack: 'Aurora Hunter - Cosmic Ambient',
      likes: 7840,
      comments: 429,
      imageGradient: 'linear-gradient(to bottom, #022c22, #064e3b, #0f766e)'
    }
  ];

  // Toggle user follow status
  const toggleFollowUser = (username: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };

  // Toggle like status for a reel
  const toggleLikeReel = (reelId: string) => {
    setLikedReels(prev => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
        setReels(curr => curr.map(r => r.id === reelId ? { ...r, likes: r.likes - 1 } : r));
      } else {
        next.add(reelId);
        setReels(curr => curr.map(r => r.id === reelId ? { ...r, likes: r.likes + 1 } : r));
      }
      return next;
    });
  };

  // Toggle save status for a reel
  const toggleSaveReel = (reelId: string) => {
    setSavedReels(prev => {
      const next = new Set(prev);
      if (next.has(reelId)) {
        next.delete(reelId);
      } else {
        next.add(reelId);
      }
      return next;
    });
  };

  // Pull-to-refresh logic
  const triggerRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    setTimeout(() => {
      const nextReel = refreshPool[refreshPoolIndex % refreshPool.length];
      setRefreshPoolIndex(prev => prev + 1);
      
      const uniqueId = `${nextReel.id}-${Date.now()}`;
      const newReel = { ...nextReel, id: uniqueId };
      
      setReels(prev => [newReel, ...prev]);
      setActiveReelIndex(0);
      setIsRefreshing(false);
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 2000);
    }, 1500);
  };

  // Scroll gesture tracking state to throttle rapid wheel scrolls
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // Debounced mouse wheel scrolling handler
  const handleReelsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    const now = Date.now();
    if (now - lastScrollTime < 850) return; // 850ms throttle
    
    if (e.deltaY > 25) {
      // Scroll Down -> Next Reel
      setActiveReelIndex(prev => (prev + 1) % reels.length);
      setLastScrollTime(now);
    } else if (e.deltaY < -25) {
      // Scroll Up -> Previous Reel OR Refresh
      if (activeReelIndex === 0) {
        triggerRefresh();
      } else {
        setActiveReelIndex(prev => (prev - 1 + reels.length) % reels.length);
      }
      setLastScrollTime(now);
    }
  };

  // Click handler for Prev Arrow (triggers refresh on first reel)
  const handlePrevReel = () => {
    if (isRefreshing) return;
    if (activeReelIndex === 0) {
      triggerRefresh();
    } else {
      setActiveReelIndex(prev => (prev - 1 + reels.length) % reels.length);
    }
  };

  // Click handler for Next Arrow
  const handleNextReel = () => {
    if (isRefreshing) return;
    setActiveReelIndex(prev => (prev + 1) % reels.length);
  };

  // Search places mock dataset
  const travelDestinations = [
    { name: 'Manali, Himachal Pradesh 🏔️', count: '4.8k posts', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80', category: 'Mountains' },
    { name: 'Ubud, Bali 🌴', count: '12.5k posts', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&auto=format&fit=crop&q=80', category: 'Tropical' },
    { name: 'Seminyak, Goa 🌊', count: '9.2k posts', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80', category: 'Beaches' },
    { name: 'Paris, France 🗼', count: '24.1k posts', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&auto=format&fit=crop&q=80', category: 'Cities' },
    { name: 'Reykjavik, Iceland ❄️', count: '3.5k posts', img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=300&auto=format&fit=crop&q=80', category: 'Winter' },
    { name: 'Amalfi Coast, Italy 🍋', count: '18.7k posts', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&auto=format&fit=crop&q=80', category: 'Cultural' }
  ];

  // Creator state
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('');
  const [selectedPresetImageIndex, setSelectedPresetImageIndex] = useState(0);
  const creatorPresets = [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80'
  ];

  // Premium Social Dashboard States
  const [postTitle, setPostTitle] = useState('Austria: Panoramic Lake');
  const [selectedPlatform, setSelectedPlatform] = useState<'Feed' | 'Stories' | 'Community' | 'Highlights'>('Feed');
  const [taggedFriends, setTaggedFriends] = useState<string[]>(['@wanderlust.jenny', '@markstravels']);
  const [friendInput, setFriendInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Mountains', 'Adventure']);
  const [scheduleDate, setScheduleDate] = useState('2026-07-04');
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [crossPostFacebook, setCrossPostFacebook] = useState(false);
  const [crossPostTwitter, setCrossPostTwitter] = useState(false);
  const [crossPostTiktok, setCrossPostTiktok] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [previewCarouselIndex, setPreviewCarouselIndex] = useState(0);
  const [locationSuggestionsExpanded, setLocationSuggestionsExpanded] = useState(false);
  const [isPreviewLiked, setIsPreviewLiked] = useState(false);
  const [isPreviewSaved, setIsPreviewSaved] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);



  // Redesigned Destination Discovery States
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [liveUpticks, setLiveUpticks] = useState<Record<number, number>>({});
  const [categoryMoodColor, setCategoryMoodColor] = useState('rgba(139, 92, 246, 0.15)'); // default violet glow
  const [typedPlaceholderIndex, setTypedPlaceholderIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  // Elevated Home Feed States
  const [hoveredStoryId, setHoveredStoryId] = useState<string | null>(null);
  const [activeDoubleTapPostId, setActiveDoubleTapPostId] = useState<string | null>(null);
  const [activeMapPostId, setActiveMapPostId] = useState<string | null>(null);
  const [postCarouselIndices, setPostCarouselIndices] = useState<Record<string, number>>({});
  const [loadedFeedImages, setLoadedFeedImages] = useState<Record<string, boolean>>({});
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [isSwitchCompressing, setIsSwitchCompressing] = useState(false);
  const [hoveredVlogId, setHoveredVlogId] = useState<string | null>(null);
  const [showBellNotifications, setShowBellNotifications] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const [globalMousePos, setGlobalMousePos] = useState({ x: -1000, y: -1000 });
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visiblePostsCount, setVisiblePostsCount] = useState(2);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const showToast = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const handleFeedCarouselLeft = (postId: string, maxLen: number) => {
    setPostCarouselIndices(prev => {
      const cur = prev[postId] || 0;
      const next = cur === 0 ? maxLen - 1 : cur - 1;
      return { ...prev, [postId]: next };
    });
  };

  const handleFeedCarouselRight = (postId: string, maxLen: number) => {
    setPostCarouselIndices(prev => {
      const cur = prev[postId] || 0;
      const next = cur === maxLen - 1 ? 0 : cur + 1;
      return { ...prev, [postId]: next };
    });
  };

  // Global mouse move tracker for reactive glows
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setGlobalMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Skeleton loader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFeed(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Live feed count-up effect
  useEffect(() => {
    if (activeTab === 'home') {
      vlogs.forEach((v) => {
        let targetViews = parseFloat(v.views.replace('K views', '')) * 1000 || 42800;
        let targetLikes = v.likes || 1254;

        let viewsStart = Math.floor(targetViews * 0.75);
        let likesStart = Math.floor(targetLikes * 0.75);

        setViewCounts(prev => ({ ...prev, [v.id]: viewsStart }));
        setLikeCounts(prev => ({ ...prev, [v.id]: likesStart }));

        let vStep = Math.ceil((targetViews - viewsStart) / 10);
        let lStep = Math.ceil((targetLikes - likesStart) / 10);

        let count = 0;
        let interval = setInterval(() => {
          count++;
          setViewCounts(prev => {
            const cur = prev[v.id] || viewsStart;
            if (cur >= targetViews || count >= 10) {
              clearInterval(interval);
              return { ...prev, [v.id]: targetViews };
            }
            return { ...prev, [v.id]: cur + vStep };
          });
          setLikeCounts(prev => {
            const cur = prev[v.id] || likesStart;
            if (cur >= targetLikes || count >= 10) {
              return { ...prev, [v.id]: targetLikes };
            }
            return { ...prev, [v.id]: cur + lStep };
          });
        }, 60);
      });
    }
  }, [activeTab]);

  // Simulated stats tick updates for live stream dashboard
  useEffect(() => {
    if (activeTab !== 'live-dashboard') return;
    
    // Set initial values
    setDashboardViewers(840);
    setDashboardLikes(1220);
    setDashboardChatRate(12);

    const interval = setInterval(() => {
      setDashboardViewers(prev => {
        const delta = Math.floor(Math.random() * 11) - 5; // ±5
        return Math.max(10, prev + delta);
      });
      setDashboardLikes(prev => {
        const delta = Math.floor(Math.random() * 8) + 2; // +2 to +9
        return prev + delta;
      });
      setDashboardChatRate(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // ±2
        return Math.max(1, prev + delta);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle stream state connecting -> live transition
  useEffect(() => {
    if (activeTab === 'live-dashboard' && streamStatus === 'connecting') {
      const timer = setTimeout(() => {
        setStreamStatus('live');
        showToast('Live stream successfully established! 🎥');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, streamStatus]);

  // --- DESTINATION DISCOVERY REDESIGN HELPERS & EFFECTS ---
  const heroDestinations = [
    { name: 'Ubud, Bali 🌴', desc: "Experience the calming spiritual energy, lush green rice terraces, and beautiful waterfalls of Bali's cultural heart.", visitors: '12.5k posts', rating: '4.9', stars: '★★★★★', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80' },
    { name: 'Reykjavik, Iceland ❄️', desc: 'Marvel at the magical Northern lights, geothermal pools, and active volcanoes in this icy Nordic wonderland.', visitors: '3.5k posts', rating: '4.8', stars: '★★★★½', img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&auto=format&fit=crop&q=80' },
    { name: 'Amalfi Coast, Italy 🍋', desc: 'Wander along vertical cliffs, colorful fishing villages, and cliffside lemon gardens overlooking the Tyrrhenian Sea.', visitors: '18.7k posts', rating: '4.9', stars: '★★★★★', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80' },
    { name: 'Manali, Himachal Pradesh 🏔️', desc: 'Explore snow-covered valleys, local wooden temples, and active winter sports routes in the high Himalayas.', visitors: '4.8k posts', rating: '4.7', stars: '★★★★½', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80' }
  ];

  // Synthesize Web Audio click/pop sound dynamically without audio assets
  const playUISound = (type: 'tap' | 'open' | 'click' | 'hover') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'open') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.006, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch (e) {
      console.warn("Web Audio block:", e);
    }
  };

  // Cycle hero index for live morphing banner
  useEffect(() => {
    if (activeTab !== 'search' || isHeroHovered) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroDestinations.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab, isHeroHovered]);

  // Command key listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => {
          const next = !prev;
          playUISound(next ? 'open' : 'click');
          return next;
        });
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleCmdK);
    return () => window.removeEventListener('keydown', handleCmdK);
  }, [soundEnabled]);

  // Typing animation suggest loop inside search palette
  useEffect(() => {
    if (!showCommandPalette) return;
    const searchSuggestions = [
      'romantic beach getaways...',
      'trekking in the Himalayas...',
      'winter snowy adventures...',
      'historic cultural pagodas...',
      'best street food spots...'
    ];
    let wordIndex = typedPlaceholderIndex;
    let charIndex = 0;
    let isDeleting = false;
    let currentWord = searchSuggestions[wordIndex];
    let timer: NodeJS.Timeout;

    const tick = () => {
      if (!isDeleting) {
        setTypedText(currentWord.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex >= currentWord.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2000);
        } else {
          timer = setTimeout(tick, 100);
        }
      } else {
        setTypedText(currentWord.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex <= 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % searchSuggestions.length;
          setTypedPlaceholderIndex(wordIndex);
          currentWord = searchSuggestions[wordIndex];
          timer = setTimeout(tick, 500);
        } else {
          timer = setTimeout(tick, 50);
        }
      }
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [showCommandPalette, typedPlaceholderIndex]);

  // Uptick likes simulation loop
  useEffect(() => {
    if (activeTab !== 'search') return;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * travelDestinations.length);
      setLiveUpticks(prev => ({
        ...prev,
        [randomIdx]: (prev[randomIdx] || 0) + 1
      }));
    }, 7000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const [mediaLibrary, setMediaLibrary] = useState([
    { id: 'lib-1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80', name: 'mountain_sunrise.jpg', size: '1.2 MB', dimensions: '1920x1080' },
    { id: 'lib-2', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80', name: 'amalfi_sunset.jpg', size: '2.4 MB', dimensions: '2400x1600' },
    { id: 'lib-3', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80', name: 'paris_eiffel.jpg', size: '980 KB', dimensions: '1200x800' },
    { id: 'lib-4', url: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80', name: 'iceland_winter.jpg', size: '1.8 MB', dimensions: '1600x1200' },
    { id: 'lib-5', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', name: 'goa_beach.jpg', size: '1.5 MB', dimensions: '1920x1080' },
    { id: 'lib-6', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80', name: 'manali_valley.jpg', size: '1.1 MB', dimensions: '1200x900' }
  ]);

  const [postImages, setPostImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop&q=80'
  ]);

  // Comment input state dictionary
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Creator Dashboard Refined wizard states
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isStepChanging, setIsStepChanging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [previewPulse, setPreviewPulse] = useState(false);
  const [likeParticles, setLikeParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    setIsStepChanging(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsStepChanging(false);
    }, 220);
  };

  useEffect(() => {
    if (activeTab !== 'create') return;
    setPreviewPulse(true);
    const timer = setTimeout(() => setPreviewPulse(false), 650);
    return () => clearTimeout(timer);
  }, [postTitle, newPostLocation, newPostCaption, postImages, activeTab]);

  const triggerDoubleTapParticles = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    setLikeParticles(newParticles);
    setTimeout(() => setLikeParticles([]), 700);
  };

  // Story progression effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showStoryViewer) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            // Advance or close
            setActiveStoryIndex((currIndex) => {
              const imageStories = stories.filter(s => s.image);
              if (currIndex < imageStories.length - 1) {
                return currIndex + 1;
              } else {
                setShowStoryViewer(false);
                return 0;
              }
            });
            return 0;
          }
          return prev + 2.5; // full in 4s
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [showStoryViewer, activeStoryIndex, stories]);

  // Direct Inbox Messages Handlers
  const handleSendMiniMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!miniActiveChatBuddy || !miniChatInput.trim()) return;

    const newMsg = {
      sender: 'me' as const,
      text: miniChatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => ({
      ...prev,
      [miniActiveChatBuddy]: [...(prev[miniActiveChatBuddy] || []), newMsg]
    }));
    setMiniChatInput('');

    // Buddy Auto response
    const currentBuddy = miniActiveChatBuddy;
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'backpacker_sam': [
          'Wow, that sounds awesome! 🏔️ Can’t wait to meet up.',
          'Let’s catch up later, going out for a trek now! 🚶‍♂️',
          'Perfect! Let know if you need anything from the local guides.'
        ],
        'wanderlust_jenny': [
          'Amazing! Bali has so many hidden gems. 🌴',
          'Are you visiting Ubud soon?',
          'Let’s meet at the beach club! 🍹'
        ],
        'nomad_alex': [
          'Definitely, let’s sync up. 🚀',
          'Sounds good! Let me check my itinerary.',
          'Good choice. Homestays are lovely.'
        ]
      };
      
      const buddyResponses = responses[currentBuddy] || ['Nice! Let me know.'];
      const randomResponse = buddyResponses[Math.floor(Math.random() * buddyResponses.length)];

      const replyMsg = {
        sender: 'them' as const,
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) => ({
        ...prev,
        [currentBuddy]: [...(prev[currentBuddy] || []), replyMsg]
      }));
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: 'me' as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => ({
      ...prev,
      [activeChatBuddy]: [...(prev[activeChatBuddy] || []), newMsg]
    }));
    setChatInput('');

    // Buddy Auto response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'backpacker_sam': [
          'Wow, that sounds awesome! 🏔️ Can’t wait to meet up.',
          'Let’s catch up later, going out for a trek now! 🚶‍♂️',
          'Perfect! Let me know if you need anything from the local guides.'
        ],
        'wanderlust_jenny': [
          'Amazing! Bali has so many hidden gems. 🌴',
          'Are you visiting Ubud soon?',
          'Let’s meet at the beach club! 🍹'
        ],
        'nomad_alex': [
          'Definitely, let’s sync up. 🚀',
          'Sounds good! Let me check my itinerary.',
          'Good choice. Homestays are lovely.'
        ]
      };
      
      const buddyResponses = responses[activeChatBuddy] || ['Nice! Let me know.'];
      const randomResponse = buddyResponses[Math.floor(Math.random() * buddyResponses.length)];

      const replyMsg = {
        sender: 'them' as const,
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations((prev) => ({
        ...prev,
        [activeChatBuddy]: [...(prev[activeChatBuddy] || []), replyMsg]
      }));
    }, 1200);
  };

  // AI Chatbot Handler
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput.trim();
    const newUserMsg = { sender: 'user' as const, text: userText };
    setAiChatMessages((prev) => [...prev, newUserMsg]);
    setAiInput('');
    setAiTyping(true);

    // AI Responses
    setTimeout(() => {
      let aiText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('itinerary') || textLower.includes('plan')) {
        aiText = '🗺️ **Recommended 3-Day Travel Itinerary:**\n\n**Day 1: Cultural Sightseeing**\n- Morning: Historical walk around town.\n- Afternoon: Local marketplace food tour.\n- Evening: Catch a sunset at the mountain terrace.\n\n**Day 2: Wilderness Trail**\n- Morning: Trek towards waterfalls or cliffs.\n- Afternoon: Refresh at a lake picnic.\n- Evening: Fireside dinner under the stars.\n\n**Day 3: Connect & Chill**\n- Morning: Cozy local cafes.\n- Afternoon: Social group tour with local Travora buddies!';
      } else if (textLower.includes('bali') || textLower.includes('ubud')) {
        aiText = '🌴 **Bali Travel Tips:**\n- **Places:** Tegallalang rice fields, Kanto Lampo waterfall, Uluwatu cliff temple.\n- **Buddy Connect:** Connect with @wanderlust_jenny who is active in Ubud right now!\n- **Safety:** Rent a motorbike, but always keep a digital license on your phone.';
      } else if (textLower.includes('manali') || textLower.includes('himachal')) {
        aiText = '🏔️ **Manali Guide:**\n- **Must See:** Jogini Falls, Solang Valley, Hampta trekking camp.\n- **Local Buddy:** @backpacker_sam is climbing nearby peaks and sharing live updates!\n- **Dish:** Siddu with melted ghee is a local warm delight.';
      } else if (textLower.includes('goa')) {
        aiText = '🌊 **Goa Recommendations:**\n- **Beaches:** Palolem (quiet South) or Arambol (creative North).\n- **Stays:** Private villas via @stay_luxury_bali (direct in-app chat).\n- **Vibe:** Sunset drums at Arambol sweet lake is a must!';
      } else {
        aiText = '✈️ That sounds like a wonderful adventure! I recommend connecting with travel buddies like @backpacker_sam or @wanderlust_jenny who have visited similar spots recently. \n\nLet me know if you need specific packing lists, weather forecasts, or hotel recommendations!';
      }

      setAiChatMessages((prev) => [...prev, { sender: 'ai' as const, text: aiText }]);
      setAiTyping(false);
    }, 1200);
  };

  // Like Toggle
  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === id ? { ...p, likesCount: p.likesCount - 1 } : p))
        );
      } else {
        next.add(id);
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p))
        );
      }
      return next;
    });
  };

  // Save Toggle
  const toggleSave = (id: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Inline Comment Adding
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              { id: `c-${Date.now()}`, username: user?.username || 'travel_buddy', text }
            ]
          };
        }
        return p;
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Create custom post handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim()) return;

    setPublishStatus('loading');

    setTimeout(() => {
      setPublishStatus('success');

      // Parse hashtags dynamically from the caption, fallback if none found
      const parsedHashtags = (newPostCaption.match(/#[a-zA-Z0-9_]+/g) || ['#travora', '#explore', '#wanderlust']) as string[];
      
      // Choose the first image in the attached images as the primary thumbnail/image for feed compatibility
      const primaryImage = postImages.length > 0 ? postImages[0] : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80';

      const newPost: Post = {
        id: `post-${Date.now()}`,
        username: user?.username || 'isabella_nilsson',
        avatar: user?.avatarUrl || '🌟',
        location: newPostLocation.trim() || 'Travel Heaven 📍',
        image: primaryImage,
        images: postImages.length > 0 ? postImages : [primaryImage],
        title: postTitle.trim(),
        caption: newPostCaption.trim(),
        hashtags: parsedHashtags,
        likesCount: 0,
        comments: [],
        categories: selectedCategories,
        platform: selectedPlatform,
        scheduleDate,
        scheduleTime,
        visibility,
        allowComments
      };

      setPosts((prev) => [newPost, ...prev]);
    
      setTimeout(() => {
        setPublishStatus('idle');

        // Reset states after publishing
        setNewPostCaption('');
        setNewPostLocation('');
        setPostTitle('');
        setTaggedFriends(['@wanderlust.jenny', '@markstravels']);
        setSelectedCategories(['Adventure']);
        setPostImages([
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80'
        ]);
        
        showToast('Post published successfully! ✨');
        setActiveTab('home');
        setCurrentStep(1); // Reset wizard to step 1
      }, 1200);
    }, 1800);
  };

  // Media panel helper functions
  const handleMediaUpload = (files: File[]) => {
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const name = file.name;
      const dimensions = '1920x1080';
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const newItem = {
        id: `lib-${Date.now()}-${Math.random()}`,
        url,
        name,
        size: sizeStr,
        dimensions
      };
      setMediaLibrary(prev => [newItem, ...prev]);
      setPostImages(prev => [...prev, url]);
    });
  };

  const toggleMediaSelection = (url: string) => {
    setPostImages(prev => {
      if (prev.includes(url)) {
        return prev.filter(img => img !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const moveMedia = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= postImages.length) return;
    setPostImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Live Preview Helper for double tap like
  const handleDoubleTapPreview = (e: React.MouseEvent) => {
    setIsPreviewLiked(true);
    setShowHeartOverlay(true);
    triggerDoubleTapParticles(e);
    setTimeout(() => {
      setShowHeartOverlay(false);
    }, 800);
  };

  // Live Preview Helper for click-to-slide
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (postImages.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (clickX < width * 0.4) {
      setPreviewCarouselIndex(prev => (prev === 0 ? postImages.length - 1 : prev - 1));
    } else {
      setPreviewCarouselIndex(prev => (prev === postImages.length - 1 ? 0 : prev + 1));
    }
  };

  // --- PROFILE DASHBOARD REDESIGN STATES ---
  const [profileTab, setProfileTab] = useState<'posts' | 'saved' | 'milestones' | 'settings'>('posts');
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('Exploring the globe one country at a time | Mountain climber & Coffee lover | Vlogging my journeys.');
  const [editWebsite, setEditWebsite] = useState('travora.com/shashank');

  // Sync user details to edit inputs when user is loaded
  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName || '');
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  // Mock User Posts dataset (Polaroid travel postcards)
  const [userPosts, setUserPosts] = useState([
    {
      id: 'up-1',
      title: 'Sunrise over Ubud rice terraces',
      location: 'Ubud, Bali',
      img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
      likes: 412,
      comments: 32,
      category: 'Tropical'
    },
    {
      id: 'up-2',
      title: 'Solo bike ride through the mountain pass',
      location: 'Khardung La, Ladakh',
      img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
      likes: 624,
      comments: 48,
      category: 'Mountains'
    },
    {
      id: 'up-3',
      title: 'Golden sunset at Fushimi Inari',
      location: 'Kyoto, Japan',
      img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
      likes: 589,
      comments: 41,
      category: 'Cultural'
    },
    {
      id: 'up-4',
      title: 'Eiffel Tower from the streets of Paris',
      location: 'Paris, France',
      img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=600&auto=format&fit=crop&q=80',
      likes: 832,
      comments: 72,
      category: 'Cities'
    },
    {
      id: 'up-5',
      title: 'Camping under a blanket of stars',
      location: 'Nubra Valley, India',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
      likes: 914,
      comments: 89,
      category: 'Mountains'
    },
    {
      id: 'up-6',
      title: 'Hidden cave pool swimming',
      location: 'Seminyak, Goa',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      likes: 351,
      comments: 18,
      category: 'Beaches'
    }
  ]);

  // Mock Highlights / Stories data (no emojis)
  const highlights = [
    {
      id: 'hl-1',
      title: 'Bali',
      cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', caption: 'Rice fields in Ubud' },
        { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', caption: 'Sunset surfing in Uluwatu' }
      ]
    },
    {
      id: 'hl-2',
      title: 'Leh',
      cover: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80', caption: 'Breathtaking Ladakh mountains' },
        { img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', caption: 'Stargazing at Nubra Valley' }
      ]
    },
    {
      id: 'hl-3',
      title: 'Kyoto',
      cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', caption: 'Kyoto bamboo trees' },
        { img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&q=80', caption: 'Cherry blossoms peak season' }
      ]
    },
    {
      id: 'hl-4',
      title: 'Paris',
      cover: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=150&auto=format&fit=crop&q=80',
      stories: [
        { img: 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&q=80', caption: 'Morning walks in Montmartre' }
      ]
    }
  ];

  interface Milestone {
    id: string;
    title: string;
    desc: string;
    unlocked: boolean;
    points: number;
    badgeColor: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    rarityPercent: string;
    statValue: string;
    date?: string;
    progress?: string;
  }

  // Mock Travel Milestones (no emojis)
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'ms-1', title: 'First Flight', desc: 'Booked and took first flight to a new destination.', unlocked: true, date: 'March 14, 2025', points: 100, badgeColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', rarity: 'common', rarityPercent: '85%', statValue: '1 flight' },
    { id: 'ms-2', title: 'Mountain Conqueror', desc: 'Ascended above 4,000m altitude in Leh pass.', unlocked: true, date: 'May 20, 2025', points: 250, badgeColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', rarity: 'epic', rarityPercent: '18%', statValue: '4,200m alt' },
    { id: 'ms-3', title: 'Tropical Nomad', desc: 'Vlogged live in Ubud cafes and beach settings.', unlocked: true, date: 'June 02, 2025', points: 200, badgeColor: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', rarity: 'rare', rarityPercent: '45%', statValue: '3 cafes' },
    { id: 'ms-4', title: 'Globetrotter Pro', desc: 'Visit 5 or more countries around the world.', unlocked: false, progress: '3/5', points: 500, badgeColor: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', rarity: 'legendary', rarityPercent: '4%', statValue: '3/5 countries' },
    { id: 'ms-5', title: 'Storyteller Master', desc: 'Uploaded 5 or more vlogs or posts to Travora.', unlocked: true, date: 'June 28, 2026', points: 300, badgeColor: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', rarity: 'legendary', rarityPercent: '9%', statValue: '7 posts' },
    { id: 'ms-6', title: 'Passport Stamped', desc: 'Completed your first international trip.', unlocked: true, date: 'June 29, 2026', points: 150, badgeColor: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', rarity: 'common', rarityPercent: '72%', statValue: '1 stamp' },
    { id: 'ms-7', title: 'Night Owl Explorer', desc: 'Checked in at a destination after midnight local time.', unlocked: true, date: 'June 30, 2026', points: 180, badgeColor: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)', rarity: 'common', rarityPercent: '61%', statValue: '01:24 AM' },
    { id: 'ms-8', title: 'Local Favorite', desc: 'Had a post liked by 50+ people from the destination country.', unlocked: false, progress: '38/50', points: 350, badgeColor: 'linear-gradient(135deg, #f43f5e 0%, #d946ef 100%)', rarity: 'epic', rarityPercent: '12%', statValue: '38/50 likes' },
    { id: 'ms-9', title: 'Streak Keeper', desc: 'Posted travel content for 7 consecutive days.', unlocked: false, progress: '5/7', points: 400, badgeColor: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', rarity: 'epic', rarityPercent: '8%', statValue: '5/7 days' },
    { id: 'ms-10', title: 'Hidden Gem Hunter', desc: 'Tagged a location with fewer than 100 prior check-ins.', unlocked: false, progress: '0/1', points: 600, badgeColor: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', rarity: 'legendary', rarityPercent: '2%', statValue: '0/1 gems' },
    { id: 'ms-11', title: 'Community Builder', desc: 'Reached 1,000 followers on Travora.', unlocked: true, date: 'July 02, 2026', points: 300, badgeColor: 'linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)', rarity: 'rare', rarityPercent: '27%', statValue: '1,048 followers' },
    { id: 'ms-12', title: 'Road Warrior', desc: 'Logged 5,000+ km of travel distance in-app.', unlocked: false, progress: '4200/5000', points: 700, badgeColor: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', rarity: 'legendary', rarityPercent: '3%', statValue: '4,200/5,000 km' },
    { id: 'ms-13', title: 'Culture Seeker', desc: 'Visited destinations across 3 different continents.', unlocked: false, progress: '2/3', points: 800, badgeColor: 'linear-gradient(135deg, #ec4899 0%, #be123c 100%)', rarity: 'legendary', rarityPercent: '1.5%', statValue: '2/3 continents' }
  ]);

  // Crest click click click click click easter egg state
  const [crestClickCount, setCrestClickCount] = useState(0);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const handleCrestClick = () => {
    const nextCount = crestClickCount + 1;
    if (nextCount >= 5) {
      setShowDevPanel(!showDevPanel);
      showToast(showDevPanel ? 'Developer tools hidden 🔒' : 'Developer tools activated! 🛠️');
      setCrestClickCount(0);
    } else {
      setCrestClickCount(nextCount);
      setTimeout(() => setCrestClickCount(c => c === nextCount ? 0 : c), 3000);
    }
  };

  // Premium Game-Quality Milestones States
  const [milestonesView, setMilestonesView] = useState<'grid' | 'timeline'>('grid');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [tokenTurnedId, setTokenTurnedId] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);

  // Premium Profile Header States
  const [profileOwnerUser, setProfileOwnerUser] = useState<any | null>(null);
  const [showCountriesPopover, setShowCountriesPopover] = useState(false);
  const [animatedPosts, setAnimatedPosts] = useState(0);
  const [animatedFollowers, setAnimatedFollowers] = useState(0);
  const [animatedFollowing, setAnimatedFollowing] = useState(0);
  const [animatedCountries, setAnimatedCountries] = useState(0);
  const [animatedBadges, setAnimatedBadges] = useState(0);
  const [unlockingMilestoneId, setUnlockingMilestoneId] = useState<string | null>(null);
  const [celebrationConfetti, setCelebrationConfetti] = useState(false);
  const [shareBadge, setShareBadge] = useState<any | null>(null);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [animatedBadgesCount, setAnimatedBadgesCount] = useState(0);
  const [activeTimelinePopoverId, setActiveTimelinePopoverId] = useState<string | null>(null);

  // Premium Highlights Story Modal States
  const [storyTimerProgress, setStoryTimerProgress] = useState(0);
  const [storyImageLoaded, setStoryImageLoaded] = useState(false);

  // Audio synthesizer for achievement unlock chime
  const playUnlockSound = () => {
    if (soundMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.15, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playTone(523.25, now, 0.12, 'triangle'); // C5
      playTone(659.25, now + 0.1, 0.12, 'triangle'); // E5
      playTone(783.99, now + 0.2, 0.12, 'triangle'); // G5
      playTone(1046.50, now + 0.3, 0.4, 'sine'); // C6
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  // XP Progress & Badges count fill animation on Tab load
  useEffect(() => {
    if (profileTab === 'milestones') {
      setAnimatedXP(0);
      setAnimatedBadgesCount(0);
      const targetXP = milestones.reduce((sum, ms) => sum + (ms.unlocked ? ms.points : 0), 0);
      const unlockedCount = milestones.filter(m => m.unlocked).length;

      let curXP = 0;
      const xpTimer = setInterval(() => {
        curXP += Math.ceil(targetXP / 20);
        if (curXP >= targetXP) {
          curXP = targetXP;
          clearInterval(xpTimer);
        }
        setAnimatedXP(curXP);
      }, 35);

      let curBadges = 0;
      const badgesTimer = setInterval(() => {
        curBadges += 1;
        if (curBadges >= unlockedCount) {
          curBadges = unlockedCount;
          clearInterval(badgesTimer);
        }
        setAnimatedBadgesCount(curBadges);
      }, 100);

      return () => {
        clearInterval(xpTimer);
        clearInterval(badgesTimer);
      };
    }
  }, [profileTab, milestones]);

  // Stats summary numbers count-up animation on Profile Tab load
  useEffect(() => {
    if (activeTab === 'profile') {
      const postsTarget = profileOwnerUser ? parseInt(profileOwnerUser.postsCount) : userPosts.length;
      const followersTarget = profileOwnerUser ? 24800 : 12500;
      const followingTarget = profileOwnerUser ? 412 : 595;
      const countriesTarget = profileOwnerUser ? parseInt(profileOwnerUser.countriesCount) : 6;
      const badgesTarget = profileOwnerUser ? parseInt(profileOwnerUser.badgesCount) : milestones.filter(m => m.unlocked).length;

      setAnimatedPosts(0);
      setAnimatedFollowers(0);
      setAnimatedFollowing(0);
      setAnimatedCountries(0);
      setAnimatedBadges(0);

      let postsVal = 0;
      let followersVal = 0;
      let followingVal = 0;
      let countriesVal = 0;
      let badgesVal = 0;

      const interval = setInterval(() => {
        let done = true;
        if (postsVal < postsTarget) {
          postsVal += Math.ceil(postsTarget / 15) || 1;
          if (postsVal >= postsTarget) postsVal = postsTarget;
          done = false;
        }
        if (followersVal < followersTarget) {
          followersVal += Math.ceil(followersTarget / 15) || 100;
          if (followersVal >= followersTarget) followersVal = followersTarget;
          done = false;
        }
        if (followingVal < followingTarget) {
          followingVal += Math.ceil(followingTarget / 15) || 10;
          if (followingVal >= followingTarget) followingVal = followingTarget;
          done = false;
        }
        if (countriesVal < countriesTarget) {
          countriesVal += 1;
          if (countriesVal >= countriesTarget) countriesVal = countriesTarget;
          done = false;
        }
        if (badgesVal < badgesTarget) {
          badgesVal += 1;
          if (badgesVal >= badgesTarget) badgesVal = badgesTarget;
          done = false;
        }

        setAnimatedPosts(postsVal);
        setAnimatedFollowers(followersVal);
        setAnimatedFollowing(followingVal);
        setAnimatedCountries(countriesVal);
        setAnimatedBadges(badgesVal);

        if (done) clearInterval(interval);
      }, 35);

      return () => clearInterval(interval);
    }
  }, [activeTab, profileOwnerUser, userPosts, milestones]);

  const openUserProfile = (username: string) => {
    // Look up in reels or mock one
    if (username === '@Suvarnatest' || username === user?.username) {
      setProfileOwnerUser(null);
    } else {
      const reelUser = reels.find(r => r.username === username);
      if (reelUser) {
        setProfileOwnerUser({
          username: reelUser.username,
          fullName: reelUser.username.slice(1).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          avatarUrl: reelUser.avatar || null,
          bio: 'Exploring the world one adventure at a time. | Mountain climber & Coffee lover',
          followersCount: '24800',
          followingCount: '412',
          postsCount: '18',
          countriesCount: '14',
          badgesCount: '8'
        });
      } else {
        setProfileOwnerUser({
          username: username,
          fullName: username.slice(1).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          avatarUrl: null,
          bio: 'Travel enthusiast. Capturing moments worldwide. | Adventure seeker',
          followersCount: '5200',
          followingCount: '280',
          postsCount: '12',
          countriesCount: '5',
          badgesCount: '3'
        });
      }
    }
    setActiveTab('profile');
  };


  // Confetti particles for real-time unlock
  const [particlesList, setParticlesList] = useState<{ id: number; color: string; x: number; y: number; vx: number; vy: number }[]>([]);
  useEffect(() => {
    if (celebrationConfetti) {
      // Generate confetti particles
      const colors = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#06b6d4'];
      const newParts = Array.from({ length: 60 }).map((_, i) => ({
        id: Date.now() + i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: 50 + (Math.random() - 0.5) * 10, // center-ish horizontally
        y: 40 + (Math.random() - 0.5) * 10, // middle-ish vertically
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 14 - 4
      }));
      setParticlesList(newParts);

      // Animate particles list down
      const interval = setInterval(() => {
        setParticlesList(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx * 0.1,
          y: p.y + p.vy * 0.1,
          vy: p.vy + 0.7 // gravity
        })).filter(p => p.y < 120 && p.x > -20 && p.x < 120));
      }, 30);

      const endTimer = setTimeout(() => {
        setCelebrationConfetti(false);
        setParticlesList([]);
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(endTimer);
      };
    }
  }, [celebrationConfetti]);

  const getProgressFraction = (progressStr?: string) => {
    if (!progressStr) return 0;
    const parts = progressStr.split('/');
    if (parts.length === 2) {
      const val = parseFloat(parts[0]) / parseFloat(parts[1]);
      return isNaN(val) ? 0 : val;
    }
    return 0;
  };

  const getTimelineConnectionLabel = (index: number) => {
    const labels = [
      "Starting out...",
      "2 months later",
      "500 km logged",
      "First border crossing",
      "3 weeks travel streak",
      "Finding rare gems",
      "Gaining followers",
      "Continent hop",
      "Crossing oceans",
      "Frequent flyer status",
      "Explorer Elite rank",
      "Legendary status achieved"
    ];
    return labels[index] || "Moving along...";
  };

  const [tiltStyle, setTiltStyle] = useState<Record<string, React.CSSProperties>>({});

  const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const tiltX = -(y / (rect.height / 2)) * 15;
    const tiltY = (x / (rect.width / 2)) * 15;
    
    setTiltStyle(prev => ({
      ...prev,
      [id]: {
        transform: `perspective(300px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.06)`,
        transition: 'transform 0.05s ease-out'
      }
    }));
  };

  const handleMouseLeave = (id: string) => {
    setTiltStyle(prev => ({
      ...prev,
      [id]: {
        transform: 'perspective(300px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.4, 1)'
      }
    }));
  };

  const triggerMockUnlock = () => {
    const isUnlocked = milestones.find(m => m.id === 'ms-4')?.unlocked;
    if (isUnlocked) {
      setMilestones(prev => prev.map(m => m.id === 'ms-4' ? { ...m, unlocked: false, date: undefined } : m));
      setUnlockingMilestoneId(null);
      showToast('Globetrotter Pro milestone locked! Click unlock to celebrate! 🔒');
    } else {
      setUnlockingMilestoneId('ms-4');
      setTimeout(() => {
        playUnlockSound();
        setCelebrationConfetti(true);
        setMilestones(prev => prev.map(m => m.id === 'ms-4' ? { ...m, unlocked: true, date: 'July 05, 2026' } : m));
        showToast('Trophy Unlocked: Globetrotter Pro! 🏆');
      }, 500);
    }
  };

  const toggleCardFlip = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (expandedMilestoneId === id) {
      // Close sequence
      setExpandedMilestoneId(null);
      setTimeout(() => {
        setTokenTurnedId(null);
      }, 250); // wait for collapse stretch
    } else if (expandedMilestoneId !== null) {
      // Another card is open. Collapse it first.
      setExpandedMilestoneId(null);
      setTimeout(() => {
        setTokenTurnedId(null);
        
        // Wait for collapse + flip back, then trigger open sequence on new card
        setTimeout(() => {
          setTokenTurnedId(id);
          setTimeout(() => {
            setExpandedMilestoneId(id);
          }, 180); // turn duration
        }, 150); // reverse turn duration
      }, 250); // collapse duration
    } else {
      // Open sequence from resting state
      setTokenTurnedId(id);
      setTimeout(() => {
        setExpandedMilestoneId(id);
      }, 180); // turn duration
    }
  };

  // Current slide index for highlight stories popup viewer
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Search Filters and Map View States
  const [showFilters, setShowFilters] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [filterPriceMax, setFilterPriceMax] = useState(500);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);

  // Memoized destinations list based on active filters
  const baseDestinations = React.useMemo(() => {
    return travelDestinations
      .map((dest, idx) => {
        const mockPrices = [120, 240, 180, 320, 150, 290];
        const mockRatings = [4.5, 4.8, 4.2, 4.9, 4.6, 4.7];
        const mockAmenities = [
          ['Free WiFi', 'Mountain View', 'Kitchen'],
          ['Free WiFi', 'Swimming Pool', 'Ocean View', 'Spa'],
          ['Free WiFi', 'Swimming Pool', 'Ocean View'],
          ['Free WiFi', 'Gym', 'Kitchen'],
          ['Free WiFi', 'Gym', 'Spa'],
          ['Free WiFi', 'Ocean View', 'Swimming Pool', 'Spa']
        ];
        return {
          ...dest,
          price: mockPrices[idx % mockPrices.length],
          ratingNum: mockRatings[idx % mockRatings.length],
          amenitiesList: mockAmenities[idx % mockAmenities.length]
        };
      })
      .filter(dest => {
        const matchesSearch = searchQuery ? dest.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        const matchesCategory = activeExploreCategory === 'All' || dest.category === activeExploreCategory;
        const matchesPrice = dest.price <= filterPriceMax;
        const matchesRating = !filterRating || dest.ratingNum >= filterRating;
        const matchesAmenities = filterAmenities.every(am => dest.amenitiesList.includes(am));
        return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAmenities;
      });
  }, [searchQuery, activeExploreCategory, filterPriceMax, filterRating, filterAmenities]);

  // Lock body background scroll when highlights modal is open
  useEffect(() => {
    if (selectedHighlight) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedHighlight]);

  // Escape key listener to close highlights modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedHighlight(null);
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Story Timer Autoplay Progress Bar and Auto-Advance Logic
  useEffect(() => {
    if (selectedHighlight) {
      setStoryTimerProgress(0);
      setStoryImageLoaded(false);
      const duration = 5000; // 5 seconds per story
      const intervalTime = 50; // update progress every 50ms
      const step = (intervalTime / duration) * 100;

      const timer = setInterval(() => {
        setStoryTimerProgress(prev => {
          if (prev >= 100) {
            const hl = highlights.find(h => h.id === selectedHighlight);
            if (hl) {
              if (activeStoryIdx < hl.stories.length - 1) {
                setActiveStoryIdx(prevIdx => prevIdx + 1);
              } else {
                setSelectedHighlight(null);
              }
            }
            return 0;
          }
          return prev + step;
        });
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [selectedHighlight, activeStoryIdx]);

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Password Validation
  const checkPassword = (val: string) => {
    return {
      length: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val)
    };
  };
  const PasswordChecklist = ({ pwd }: { pwd: string }) => {
    if (!pwd) return null;
    const checks = checkPassword(pwd);
    if (Object.values(checks).every(Boolean)) return null;

    return (
      <ul style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '8px', paddingLeft: '16px', lineHeight: '1.6', fontWeight: 500 }}>
        {!checks.length && <li>At least 8 characters</li>}
        {!checks.uppercase && <li>One uppercase letter</li>}
        {!checks.lowercase && <li>One lowercase letter</li>}
        {!checks.number && <li>One number</li>}
        {!checks.special && <li>One special character</li>}
      </ul>
    );
  };

  useEffect(() => {
    if (!loading) {
      const delayTimeout = setTimeout(() => {
        setFadeClass('fade-out');
        const removalTimeout = setTimeout(() => {
          setShowSplash(false);
          setContentVisible(true);
        }, 800);
        return () => clearTimeout(removalTimeout);
      }, 1000);
      return () => clearTimeout(delayTimeout);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (formMode === 'login') {
        const result = await login(identifier, password);
        if (result.success) {
          localStorage.removeItem('user_view_mode');
          setSuccessMsg('Logged in successfully!');
          setIdentifier('');
          setPassword('');
        } else {
          setErrorMsg(result.error || 'Invalid credentials');
        }
      } else {
        // Sign Up Flow
        if (!Object.values(checkPassword(password)).every(Boolean)) {
          setErrorMsg('Please fix the errors before submitting.');
          setSubmitting(false);
          return;
        }

        const signupData: any = {
          role: userRole,
          username,
          email,
          phone,
          password,
          fullName,
        };

        if (userRole === 'traveller') {
          signupData.travellerType = isVlogger ? 'vlogger' : 'normal';
        } else {
          signupData.businessProfile = {
            businessType,
            businessName,
            registrationNumber,
            phone,
            address,
            websiteUrl: websiteUrl || undefined,
            bookingModel: bookingModel
          };
        }

        const result = await signup(signupData);
        if (result.success) {
          localStorage.removeItem('user_view_mode');
          setSuccessMsg('Account created successfully!');
          setUsername('');
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
          setBusinessName('');
          setRegistrationNumber('');
          setAddress('');
          setWebsiteUrl('');
        } else {
          setErrorMsg(result.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Traveller Type directly on Dashboard
  const handleDashboardToggleVlogger = async (checked: boolean) => {
    const targetType = checked ? 'vlogger' : 'normal';
    const result = await updateTravellerType(targetType);
    if (!result.success) {
      alert(result.error || 'Failed to switch profile type');
    }
  };

  // Helper arrays for Birthday drop downs
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 80 }, (_, i) => String(2026 - i));

  // Forgot Password Handlers
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    const res = await forgotPassword(forgotIdentifier);
    setForgotLoading(false);
    if (res.success) {
      setForgotStep(2);
      alert('Simulated OTP sent to your email/phone: ' + res.simulatedOtp);
    } else {
      setForgotError(res.error || 'Failed to send OTP');
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    const res = await verifyOtp(forgotIdentifier, forgotOtp);
    setForgotLoading(false);
    if (res.success) {
      setForgotStep(3);
    } else {
      setForgotError(res.error || 'Invalid OTP');
    }
  };

  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    if (!Object.values(checkPassword(forgotNewPassword)).every(Boolean)) {
      setForgotError('Please fix the password errors before submitting.');
      return;
    }
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    const res = await resetPassword(forgotIdentifier, forgotOtp, forgotNewPassword);
    setForgotLoading(false);
    if (res.success) {
      setForgotSuccess('Password reset successfully!');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotIdentifier(''); setForgotOtp(''); setForgotNewPassword(''); setForgotConfirmPassword('');
      }, 2000);
    } else {
      setForgotError(res.error || 'Failed to reset password');
    }
  };

  if (user) {
    const activeImageStories = stories.filter(s => s.image);

    const isSidebarCollapsed = activeTab === 'messages' || showSearchDrawer || showNotificationsDrawer;
    return (
      <>
        {showSplash && (
          <div className={`splash-container ${fadeClass}`}>
            <div className="splash-logo-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Logo theme={theme} width={130} showText={true} />
              <div className="splash-progress-bar">
                <div className="splash-progress-line" />
              </div>
            </div>
          </div>
        )}
        <div className={`instagram-app-layout ${(showSearchDrawer || showNotificationsDrawer) ? 'drawer-open' : ''}`}>
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
        
        {/* MOBILE ONLY: Top Header Bar */}
        <header className="mobile-header">
          <span className="social-top-nav-title" style={{ fontSize: '20px', background: 'linear-gradient(135deg, #0284c7 0%, #f97316 50%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Travora</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.role === 'business' && (
              <button 
                onClick={() => {
                  localStorage.removeItem('user_view_mode');
                  router.push('/venture/dashboard');
                }}
                className="social-nav-icon-btn"
                style={{
                  background: 'var(--brand-gradient)',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '28px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Venture
              </button>
            )}
            <button 
              className="social-nav-icon-btn" 
              onClick={() => {
                setShowNotificationsDrawer(!showNotificationsDrawer);
                setShowSearchDrawer(false);
              }}
              aria-label="Notifications"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* DESKTOP ONLY: Left Navigation Sidebar Wrapper and Sidebar */}
        <div className="instagram-sidebar-wrapper">
          <aside className="instagram-sidebar">
            
            {/* Logo */}
            <div className="instagram-sidebar-logo-container">
              <span className="instagram-sidebar-logo-icon">
                <Logo theme={theme} width={24} showText={false} />
              </span>
              <span className="instagram-sidebar-logo-text">Travora</span>
            </div>

            {/* Navigation Menu */}
            <nav className="instagram-sidebar-menu">
              
              {/* Home */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('home');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" fill={activeTab === 'home' && !showSearchDrawer && !showNotificationsDrawer ? 'var(--right-pane-bg)' : 'none'} />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Home</span>
              </button>

              {/* Search */}
              <button 
                className={`instagram-sidebar-item ${(activeTab === 'search' && !showNotificationsDrawer) || showSearchDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('search');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {((activeTab === 'search' && !showNotificationsDrawer) || showSearchDrawer) && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Search</span>
              </button>

              {/* Reels */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'reels' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('reels');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {activeTab === 'reels' && !showSearchDrawer && !showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="6" />
                    <circle cx="12" cy="12" r="6" />
                    <polygon points="10.5 9, 10.5 15, 15.5 12" fill={activeTab === 'reels' ? 'currentColor' : 'none'} />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Reels</span>
              </button>

              {/* Live */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'live' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('live');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {activeTab === 'live' && !showSearchDrawer && !showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon" style={{ position: 'relative' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                  </svg>
                  {hasLiveCreators && (
                    <span className="instagram-sidebar-badge-live-pulse" />
                  )}
                </span>
                <span className="instagram-sidebar-item-label">Live</span>
              </button>

              {/* Messages */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'messages' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('messages');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {activeTab === 'messages' && !showSearchDrawer && !showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon" style={{ position: 'relative' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Messages</span>
              </button>

              {/* Notifications */}
              <button 
                className={`instagram-sidebar-item ${showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setShowNotificationsDrawer(!showNotificationsDrawer);
                  setShowSearchDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon" style={{ position: 'relative' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={showNotificationsDrawer ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="instagram-sidebar-badge">{unreadNotifications}</span>
                  )}
                </span>
                <span className="instagram-sidebar-item-label">Notifications</span>
              </button>

              {/* Create */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'create' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('create');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {activeTab === 'create' && !showSearchDrawer && !showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </span>
                <span className="instagram-sidebar-item-label">Create</span>
              </button>

              {/* Profile */}
              <button 
                className={`instagram-sidebar-item ${activeTab === 'profile' && !showSearchDrawer && !showNotificationsDrawer ? 'active' : ''}`}
                onClick={() => {
                  setProfileOwnerUser(null);
                  setActiveTab('profile');
                  setShowSearchDrawer(false);
                  setShowNotificationsDrawer(false);
                  setShowMoreMenu(false);
                }}
              >
                {activeTab === 'profile' && !showSearchDrawer && !showNotificationsDrawer && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(236, 72, 153, 0.08)',
                      borderRadius: '12px',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="instagram-sidebar-item-icon">
                  <img 
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`} 
                    alt="Profile" 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: activeTab === 'profile' && !showSearchDrawer && !showNotificationsDrawer ? '2px solid var(--text-primary)' : '1px solid var(--card-border)' }} 
                  />
                </span>
                <span className="instagram-sidebar-item-label">Profile</span>
              </button>

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

            {/* Footer menu */}
            <div className="instagram-sidebar-footer" style={{ position: 'relative' }}>
              
               {/* More Menu Dropdown */}
              {showMoreMenu && (
                <div className="instagram-more-menu-dropdown">
                  <button className="instagram-more-menu-item" onClick={() => { setProfileOwnerUser(null); setActiveTab('profile'); setProfileTab('settings'); setShowMoreMenu(false); }}>
                    <span>⚙️</span> Settings
                  </button>
                  <button className="instagram-more-menu-item" onClick={() => { setAiChatOpen(true); setShowMoreMenu(false); }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px' }}>
                      <img src="/ai-guide.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
                    </span>
                    AI Travel Assistant
                  </button>
                  <button className="instagram-more-menu-item" onClick={() => { toggleTheme(); setShowMoreMenu(false); }}>
                    <span>{theme === 'light' ? '🌙' : '☀️'}</span> Switch Appearance
                  </button>
                  <div style={{ height: '1px', background: 'var(--card-border)', margin: '4px 0' }} />
                  <button className="instagram-more-menu-item" style={{ color: '#ef4444' }} onClick={() => { logout(); setShowMoreMenu(false); }}>
                    <span>🚪</span> Log Out
                  </button>
                </div>
              )}

              {/* More Button */}
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

        {/* --- DYNAMIC SLIDE-OUT DRAWERS PANEL --- */}
        
        {/* Search Drawer */}
        {showSearchDrawer && (
          <div className="instagram-drawer">
            <div className="instagram-drawer-header">
              <h2 className="instagram-drawer-title">Search</h2>
              <div className="search-input-wrapper">
                <span style={{ marginRight: '8px', color: 'var(--text-muted)' }}>🔍</span>
                <input 
                  type="text" 
                  className="comment-input" 
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
                  placeholder="Search destinations, buddies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="instagram-drawer-content">
              <h3 className="drawer-search-section-title">Places</h3>
              <div className="drawer-search-results">
                {travelDestinations
                  .filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((dest, idx) => (
                    <div 
                      key={idx} 
                      className="drawer-search-item"
                      onClick={() => {
                        setSearchQuery(dest.name.split(',')[0]);
                        setActiveTab('search');
                        setShowSearchDrawer(false);
                      }}
                    >
                      <img src={dest.img} alt={dest.name} className="drawer-search-item-img" />
                      <div className="drawer-search-item-info">
                        <span className="drawer-search-item-name">{dest.name}</span>
                        <span className="drawer-search-item-count">{dest.count}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Notifications Drawer */}
        {showNotificationsDrawer && (
          <div className="instagram-drawer">
            <div className="instagram-drawer-header">
              <h2 className="instagram-drawer-title">Notifications</h2>
              
              <div className="notification-filters" ref={filterBarRef}>
                <div className="liquid-glass-indicator" style={indicatorStyle}>
                  <div className="liquid-glass-indicator-glow" />
                  <div className="liquid-glass-indicator-highlight" />
                </div>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'following' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('following')}
                >
                  People you follow
                </button>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'comments' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('comments')}
                >
                  Comments
                </button>
                <button 
                  className={`notification-filter-btn ${notificationFilter === 'follows' ? 'active' : ''}`}
                  onClick={() => setNotificationFilter('follows')}
                >
                  Follows
                </button>
              </div>

            </div>
            
            <div className="instagram-drawer-content" style={{ padding: '0 24px' }}>
              
              <div className="drawer-notification-section-title">Follow requests</div>
              <div className="follow-requests-card" onClick={() => alert('Opening follow requests...')}>
                <div className="follow-requests-icon-wrapper">
                  <span className="follow-requests-icon">👥</span>
                </div>
                <div className="follow-requests-info">
                  <span className="follow-requests-title">Follow requests</span>
                  <span className="follow-requests-subtitle">test_explorer + 10 others</span>
                </div>
                <div className="follow-requests-indicator">
                  <span className="follow-requests-dot"></span>
                </div>
              </div>

              <div className="drawer-notification-section-title">This week</div>
              
              {notifications
                .filter(n => {
                  if (notificationFilter === 'comments') return n.type === 'comment';
                  if (notificationFilter === 'follows') return n.type === 'follow';
                  if (notificationFilter === 'following') return n.type === 'like' || n.type === 'comment';
                  return true;
                })
                .map((n) => (
                  <div key={n.id} className="drawer-notification-item">
                    <div className="drawer-notification-avatar-wrapper">
                      <span className="drawer-notification-avatar">
                        {n.avatar && (n.avatar.startsWith('http') || n.avatar.startsWith('https')) ? (
                          <img src={n.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          n.avatar || '👤'
                        )}
                      </span>
                    </div>
                    <div className="drawer-notification-content">
                      <p className="drawer-notification-text">
                        <span className="drawer-notification-username">{n.username}</span>
                        {n.text}
                      </p>
                      <span className="drawer-notification-time">{n.time}</span>
                    </div>
                    {n.type === 'follow' && (
                      <div className="drawer-notification-buttons">
                        <button className="notification-btn-confirm" onClick={() => alert('Confirmed follow!')}>Confirm</button>
                        <button className="notification-btn-delete" onClick={() => alert('Request deleted.')}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              }
              
            </div>
          </div>
        )}

        {/* --- MAIN DISPLAY WORKSPACE --- */}
        <div className="instagram-main-area" onClick={() => {
          // Close drawers if you click main area
          setShowSearchDrawer(false);
          setShowNotificationsDrawer(false);
        }}>
          
          <div className="page-transition-container">
            
            {/* VIEW 1: HOME FEED */}
            {activeTab === 'home' && (
              <div className="instagram-feed-layout">
                
                {/* Center feed column */}
                <div className="instagram-feed-posts-column">
                  
                  {/* Stories Card Container */}
                  <div className="stories-card-container">
                    <div className="stories-scroll-row">
                      {stories.map((story) => (
                        <div 
                          key={story.id} 
                          className="story-wrapper"
                          onMouseEnter={() => setHoveredStoryId(story.id)}
                          onMouseLeave={() => setHoveredStoryId(null)}
                          onClick={() => {
                            if (story.id === 'story-1') {
                              setActiveTab('create');
                            } else {
                              const imgStoriesIdx = activeImageStories.findIndex(s => s.id === story.id);
                              if (imgStoriesIdx !== -1) {
                                setActiveStoryIndex(imgStoriesIdx);
                                setShowStoryViewer(true);
                              }
                            }
                          }}
                        >
                          <div className={`story-ring ${story.viewed ? 'viewed' : ''} ${story.id === 'story-1' ? 'user-story-ring' : ''} ${story.isLive ? 'live-story' : ''}`}>
                            <div className="story-avatar">
                              {story.avatar.startsWith('http') ? (
                                <img src={story.avatar} alt={story.username} className="story-avatar-img" />
                              ) : (
                                story.avatar
                              )}
                            </div>
                            {story.id === 'story-1' && <div className="user-add-story-badge">+</div>}
                            {story.isLive && <span className="story-live-badge-glow">LIVE</span>}
                            {hoveredStoryId === story.id && (
                              <svg className="story-progress-arc-overlay" viewBox="0 0 70 70">
                                <circle cx="35" cy="35" r="32" className="story-progress-circle-path" />
                              </svg>
                            )}
                          </div>
                          <span className="story-username">{story.username}</span>
                          
                          {/* Floating story thumbnail preview */}
                          {hoveredStoryId === story.id && story.image && (
                            <div className="story-hover-preview-card discover-premium-card animate-slide-up">
                              <img src={story.image} alt="preview" className="story-hover-preview-img" />
                              <div className="story-hover-preview-meta">
                                <span className="story-hover-preview-text">{story.caption.slice(0, 48)}...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Posts feed with Skeleton/Shimmer loaders support */}
                  {isLoadingFeed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {[1, 2].map((i) => (
                        <div key={i} className="post-card skeleton-card">
                          <div className="post-card-header" style={{ padding: '12px 16px', display: 'flex', gap: '12px' }}>
                            <div className="skeleton-avatar skeleton-shimmer" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center' }}>
                              <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: '10px', borderRadius: '4px' }} />
                              <div className="skeleton-line skeleton-shimmer" style={{ width: '25%', height: '8px', borderRadius: '4px' }} />
                            </div>
                          </div>
                          <div className="skeleton-media skeleton-shimmer" style={{ height: '380px', margin: '0 16px', borderRadius: '16px' }} />
                          <div className="post-card-actions" style={{ padding: '16px' }}>
                            <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: '14px', borderRadius: '4px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {posts.slice(0, visiblePostsCount).map((post, postIdx) => {
                        const isLiked = likedPosts.has(post.id);
                        const isSaved = savedPosts.has(post.id);
                        const commentsOpen = expandedComments[post.id];

                        return (
                          <article 
                            key={post.id} 
                            className="post-card fade-slide-up"
                            style={{ animationDelay: `${postIdx * 0.15}s` }}
                          >
                            
                            {/* Post Header */}
                            <div className="post-card-header">
                              <div className="post-card-user-info">
                                <div className="post-card-avatar">
                                  {post.avatar.startsWith('http') ? (
                                    <img src={post.avatar} alt={post.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    post.avatar
                                  )}
                                </div>
                                <div>
                                  <span className="post-card-username">{post.username}</span>
                                  <span className="post-card-location" onClick={() => setActiveMapPostId(prev => prev === post.id ? null : post.id)}>
                                    📍 {post.location}
                                  </span>
                                </div>
                              </div>
                              <button className="post-action-btn spring-active" style={{ color: 'var(--text-muted)' }}>•••</button>
                            </div>

                            {/* Tappable Inline Map Preview Card */}
                            {activeMapPostId === post.id && (
                              <div className="post-inline-map-card discover-premium-card animate-slide-up">
                                <div className="map-card-header">
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                                    Map Explorer: {post.location}
                                  </span>
                                  <button onClick={() => setActiveMapPostId(null)} className="map-close-btn">&times;</button>
                                </div>
                                <div className="map-card-body">
                                  <div className="radar-grid-bg"></div>
                                  <div className="radar-ping"></div>
                                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '28px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>📍</span>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '12px', marginTop: '4px' }}>
                                      {post.location}
                                    </span>
                                  </div>
                                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 2, fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                                    GPS Active
                                  </div>
                                </div>
                                <div className="map-card-footer">
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Coordinates: 8.4095° S, 115.1889° E</span>
                                  <button className="map-directions-btn" onClick={() => { showToast(`Opening Google Maps for ${post.location}...`); }}>
                                    Get Directions
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Post Media Carousel with double-tap heart burst overlay */}
                            <div 
                              className="post-card-media-container" 
                              onDoubleClick={() => {
                                setActiveDoubleTapPostId(post.id);
                                if (!isLiked) {
                                  toggleLike(post.id);
                                  showToast(`Liked @${post.username}'s post`);
                                }
                                setTimeout(() => {
                                  setActiveDoubleTapPostId(null);
                                }, 800);
                              }}
                              style={{ position: 'relative', overflow: 'hidden' }}
                            >
                              <div 
                                className="post-carousel-track" 
                                style={{ 
                                  display: 'flex', 
                                  transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)', 
                                  transform: `translateX(-${(postCarouselIndices[post.id] || 0) * 100}%)`,
                                  height: '100%'
                                }}
                              >
                                {(post.images || [post.image]).map((imgUrl, imgIdx) => {
                                  const isImgLoaded = loadedFeedImages[`${post.id}-${imgIdx}`];
                                  return (
                                    <div key={imgIdx} style={{ minWidth: '100%', height: '100%', flexShrink: 0, position: 'relative' }}>
                                      {!isImgLoaded && (
                                        <div className="skeleton-loader-shimmer" style={{ position: 'absolute', inset: 0 }} />
                                      )}
                                      <img 
                                        src={imgUrl} 
                                        alt={`post-${imgIdx}`} 
                                        className={`post-card-img ${isImgLoaded ? 'sharpen' : 'blur-placeholder'}`} 
                                        onLoad={() => setLoadedFeedImages(prev => ({ ...prev, [`${post.id}-${imgIdx}`]: true }))}
                                        onClick={() => setLightboxImage(imgUrl)}
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'cover',
                                          filter: isImgLoaded ? 'none' : 'blur(15px)',
                                          transition: 'filter 0.4s ease',
                                          cursor: 'pointer'
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Heart burst scale-in overlay */}
                              {activeDoubleTapPostId === post.id && (
                                <div className="double-tap-heart-burst">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                  </svg>
                                </div>
                              )}

                              {/* Dot Indicators */}
                              {post.images && post.images.length > 1 && (
                                <>
                                  <button 
                                    className="carousel-nav-btn prev"
                                    onClick={(e) => { e.stopPropagation(); handleFeedCarouselLeft(post.id, post.images.length); }}
                                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                  >
                                    ‹
                                  </button>
                                  <button 
                                    className="carousel-nav-btn next"
                                    onClick={(e) => { e.stopPropagation(); handleFeedCarouselRight(post.id, post.images.length); }}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                  >
                                    ›
                                  </button>
                                  
                                  <div className="feed-carousel-indicators">
                                    {post.images.map((_, dotIdx) => (
                                      <span 
                                        key={dotIdx} 
                                        className={`feed-carousel-dot ${(postCarouselIndices[post.id] || 0) === dotIdx ? 'active' : ''}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Post Actions */}
                            <div className="post-card-actions">
                              <div className="post-card-left-actions">
                                <button className={`post-action-btn-with-count spring-active ${isLiked ? 'liked' : ''}`} onClick={() => {
                                  toggleLike(post.id);
                                  if (!isLiked) {
                                    showToast(`Liked @${post.username}'s post`);
                                  }
                                }}>
                                  <svg width="22" height="22" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  <span className="post-action-count animated-count">{formatCount(post.likesCount)}</span>
                                </button>
                                
                                <button className="post-action-btn-with-count spring-active" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !commentsOpen }))}>
                                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                  </svg>
                                  <span className="post-action-count">{post.comments.length}</span>
                                </button>

                                <button className="post-action-btn-with-count spring-active" onClick={() => showToast(`Link copied for @${post.username}'s post!`)}>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                  </svg>
                                </button>
                              </div>
                              <button className={`post-action-btn spring-active ${isSaved ? 'saved' : ''}`} onClick={() => {
                                toggleSave(post.id);
                                showToast(isSaved ? "Removed from saved posts" : "Saved post to bookmarks");
                              }}>
                                <svg width="22" height="22" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                            </div>

                            {/* Caption */}
                            <div className="post-card-caption-section" style={{ padding: 0, marginTop: '4px' }}>
                              <span className="post-card-caption-username">{post.username}</span>
                              <span>{post.caption}</span>
                              <div style={{ marginTop: '4px' }}>
                                {post.hashtags.map((tag, tIdx) => (
                                  <span key={tIdx} className="post-card-caption-hashtags" style={{ marginRight: '6px' }}>{tag}</span>
                                ))}
                              </div>
                            </div>

                            {/* Comment trigger */}
                            <button 
                              className="post-card-comments-toggle" 
                              style={{ padding: 0, margin: '8px 0 0 0' }}
                              onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !commentsOpen }))}
                            >
                              {commentsOpen ? 'Hide comments' : `View all ${post.comments.length} comments`}
                            </button>

                            {commentsOpen && (
                              <div className="post-card-comments-drawer" style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                                <div className="post-card-comments-list" style={{ maxHeight: '150px' }}>
                                  {post.comments.map((c) => (
                                    <div key={c.id} className="comment-item">
                                      <span className="comment-username">{c.username}</span>
                                      <span>{c.text}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="comment-input-container" style={{ marginTop: '10px' }}>
                                  <input 
                                    type="text" 
                                    className="comment-input" 
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                  />
                                  <button className="comment-submit-btn spring-active" onClick={() => handleAddComment(post.id)}>Post</button>
                                </div>
                              </div>
                            )}

                          </article>
                        );
                      })}

                      {/* Infinite Scroll Trigger Indicator */}
                      <div className="feed-infinite-scroll-trigger">
                        {isLoadingMore ? (
                          <div className="infinite-scroll-loader-spinner">
                            <div className="accent-loader-circle"></div>
                            <span>Fetching more travel stories...</span>
                          </div>
                        ) : visiblePostsCount < posts.length ? (
                          <button 
                            className="load-more-feed-btn spring-active"
                            onClick={() => {
                              setIsLoadingMore(true);
                              setTimeout(() => {
                                setVisiblePostsCount(prev => prev + 1);
                                setIsLoadingMore(false);
                                showToast("New travel posts loaded successfully!");
                              }, 1000);
                            }}
                          >
                            Load More Stories
                          </button>
                        ) : (
                          <span className="feed-end-message">✨ You've caught up with all travel updates!</span>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right side Suggestions Column */}
                <div className="instagram-feed-right-column">
                  
                  {/* Current User Card */}
                  {(() => {
                    const isVentureOrVlogger = user.role === 'business' || user.travellerType === 'vlogger';
                    
                    // Mechanical unfolding drop sequence variants
                    const dropdownVariants = {
                      initial: {
                        opacity: 0,
                        y: -12,
                        scale: 0.92,
                        scaleY: 0.8,
                        filter: 'blur(8px)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                      },
                      animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        scaleY: 1,
                        filter: 'blur(0px)',
                        borderColor: [
                          'rgba(255, 255, 255, 0.08)', 
                          'rgba(139, 92, 246, 0.8)', 
                          'rgba(255, 255, 255, 0.08)'
                        ],
                        boxShadow: [
                          '0 4px 10px rgba(0,0,0,0.5)', 
                          '0 12px 30px rgba(139, 92, 246, 0.25)', 
                          '0 12px 32px rgba(0, 0, 0, 0.6)'
                        ],
                        transition: {
                          type: 'spring',
                          stiffness: 400,
                          damping: 20,
                          staggerChildren: 0.04,
                          delayChildren: 0.06,
                          borderColor: { duration: 0.6, times: [0, 0.4, 1] },
                          boxShadow: { duration: 0.6, times: [0, 0.4, 1] }
                        }
                      },
                      exit: {
                        opacity: 0,
                        y: -12,
                        scale: 0.92,
                        scaleY: 0.8,
                        filter: 'blur(8px)',
                        transition: {
                          duration: 0.2,
                          ease: 'easeIn',
                          staggerChildren: 0.03,
                          staggerDirection: -1
                        }
                      }
                    };

                    const headerVariants = {
                      initial: { opacity: 0, y: -4 },
                      animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                      exit: { opacity: 0, y: -4, transition: { duration: 0.1 } }
                    };

                    const itemVariants = {
                      initial: { opacity: 0, x: -8 },
                      animate: { 
                        opacity: 1, 
                        x: 0, 
                        transition: { 
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 22 
                        } 
                      },
                      exit: { opacity: 0, x: -8, transition: { duration: 0.1 } }
                    };

                    const avatarVariants = {
                      initial: { opacity: 0, scale: 0.9 },
                      animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
                      exit: { opacity: 0, scale: 0.9, transition: { duration: 0.1 } }
                    };

                    const textVariants = {
                      initial: { opacity: 0, x: -4 },
                      animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
                      exit: { opacity: 0, x: -4, transition: { duration: 0.1 } }
                    };

                    const checkmarkVariants = {
                      initial: { opacity: 0, scale: 0.5 },
                      animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 15, delay: 0.2 } },
                      exit: { opacity: 0, scale: 0.5, transition: { duration: 0.1 } }
                    };

                    const handleSwitchToggle = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setIsSwitchCompressing(true);
                      setTimeout(() => {
                        setIsSwitchCompressing(false);
                        setShowSwitchDropdown(prev => !prev);
                      }, 80);
                    };

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="discover-premium-card"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '14px', 
                          padding: '12px 16px', 
                          borderRadius: '16px', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          border: '1px solid var(--card-border)',
                          marginBottom: '16px', 
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.25s ease'
                        }}
                        whileHover={{ 
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'rgba(255, 255, 255, 0.12)' 
                        }}
                        onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                      >
                        {/* Avatar Wrap with Status Ring */}
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                          style={{ 
                            position: 'relative',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            ...(isVentureOrVlogger 
                              ? { background: 'var(--brand-gradient)', padding: '2px' }
                              : { border: '2px solid rgba(255, 255, 255, 0.15)', padding: '2px' }
                            )
                          }}
                        >
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#07090e', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)', color: 'white', fontWeight: 800, fontSize: '15px' }}>
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          {/* Account Type Badge (overlay bottom-right of avatar) */}
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                            style={{ 
                              position: 'absolute', 
                              bottom: '-2px', 
                              right: '-2px', 
                              background: '#07090e', 
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '50%', 
                              width: '16px', 
                              height: '16px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                              zIndex: 2
                            }}
                            title={user.role === 'business' ? 'Venture Account' : user.travellerType === 'vlogger' ? 'Vlogger Account' : 'Traveler Account'}
                          >
                            {user.role === 'business' ? (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                              </svg>
                            ) : user.travellerType === 'vlogger' ? (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                              </svg>
                            ) : (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                              </svg>
                            )}
                          </motion.div>
                        </motion.div>

                        {/* Identity text column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{user.username}</span>
                            <span 
                              style={{ 
                                fontSize: '9px', 
                                fontWeight: 800, 
                                color: 'var(--primary)', 
                                background: 'rgba(236,72,153,0.1)', 
                                padding: '1px 5px', 
                                borderRadius: '6px',
                                border: '1px solid rgba(236,72,153,0.15)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}
                            >
                              Lv. 4
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{user.fullName}</div>
                        </div>
                        
                        {/* Switch Trigger Ghost Button */}
                        <div style={{ position: 'relative' }}>
                          <motion.button 
                            animate={{ scale: isSwitchCompressing ? 0.96 : 1 }}
                            transition={{ duration: 0.08, ease: 'easeOut' }}
                            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.18)' }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleSwitchToggle}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-primary)',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 3 21 8 16 13" />
                              <line x1="21" y1="8" x2="9" y2="8" />
                              <polyline points="8 21 3 16 8 11" />
                              <line x1="3" y1="16" x2="15" y2="16" />
                            </svg>
                            <span>Switch</span>
                          </motion.button>

                          {/* Switch Dropdown overlay */}
                          <AnimatePresence>
                            {showSwitchDropdown && (
                              <motion.div 
                                variants={dropdownVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="switch-accounts-dropdown discover-premium-card" 
                                style={{ 
                                  position: 'absolute',
                                  right: 0, 
                                  top: '36px', 
                                  zIndex: 120,
                                  background: 'rgba(9, 8, 15, 0.85)',
                                  backdropFilter: 'blur(16px)',
                                  WebkitBackdropFilter: 'blur(16px)',
                                  width: '230px',
                                  overflow: 'hidden'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <motion.div variants={headerVariants} className="switch-dropdown-header">
                                  <span>Switch Accounts</span>
                                  <button 
                                    className="switch-close-btn" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowSwitchDropdown(false);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '50%',
                                      transition: 'background 0.2s'
                                    }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                </motion.div>
                                <div className="switch-accounts-list">
                                  {/* Account 1 (Active) */}
                                  <motion.div 
                                    variants={itemVariants} 
                                    className="switch-account-item active" 
                                    onClick={() => { showToast("Already logged in as Suvarnatest"); setShowSwitchDropdown(false); }}
                                  >
                                    <motion.div 
                                      variants={avatarVariants}
                                      style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, marginRight: '8px', flexShrink: 0 }}
                                    >
                                      S
                                    </motion.div>
                                    <motion.div variants={textVariants} style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@Suvarnatest</div>
                                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Shashank (Active)</div>
                                    </motion.div>
                                    <motion.div variants={checkmarkVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </motion.div>
                                  </motion.div>
                                  
                                  {/* Account 2 */}
                                  <motion.div 
                                    variants={itemVariants} 
                                    className="switch-account-item" 
                                    onClick={() => { showToast("Switched to @traveler_shashank"); setShowSwitchDropdown(false); }}
                                  >
                                    <motion.img 
                                      variants={avatarVariants}
                                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" 
                                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px', flexShrink: 0 }} 
                                    />
                                    <motion.div variants={textVariants} style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@traveler_shashank</div>
                                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Siddhartha Chathra</div>
                                    </motion.div>
                                  </motion.div>
                                  
                                  {/* Account 3 */}
                                  <motion.div 
                                    variants={itemVariants} 
                                    className="switch-account-item" 
                                    onClick={() => { showToast("Switched to @sid_vlogs"); setShowSwitchDropdown(false); }}
                                  >
                                    <motion.img 
                                      variants={avatarVariants}
                                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px', flexShrink: 0 }} 
                                    />
                                    <motion.div variants={textVariants} style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@sid_vlogs</div>
                                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Siddhartha Vlogs</div>
                                    </motion.div>
                                  </motion.div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Suggestions Header */}
                  <div className="instagram-suggested-header">
                    <span>Suggested for you</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => showToast('Displaying travel creators near Ubud...')}>See all</button>
                  </div>

                  {/* Suggested list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { username: 'wanderlust_jenny', relation: 'Suggested for you', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', active: true },
                      { username: 'backpacker_sam', relation: 'Followed by nomad_vlogs + 2 others', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', active: false },
                      { username: 'stay_luxury_bali', relation: 'Suggested Stay partner', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', active: true }
                    ].map((sUser) => {
                      const isFld = followedUsers.has(sUser.username);
                      return (
                        <div key={sUser.username} className="instagram-suggested-user-row">
                          <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                            <img src={sUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            <span className={`suggested-presence-indicator ${sUser.active ? 'online' : 'offline'}`}></span>
                          </div>
                          <div className="instagram-suggested-user-info">
                            <span className="instagram-suggested-username">{sUser.username}</span>
                            <span className="instagram-suggested-relationship">{sUser.relation}</span>
                          </div>
                          <FollowButton
                            isFollowing={isFld}
                            onToggle={() => {
                              setFollowedUsers(prev => {
                                const next = new Set(prev);
                                if (next.has(sUser.username)) {
                                  next.delete(sUser.username);
                                  showToast(`Unfollowed @${sUser.username}`);
                                } else {
                                  next.add(sUser.username);
                                  showToast(`Started following @${sUser.username}`);
                                }
                                return next;
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Vlogs Scrollable Feed Section */}
                  <div className="vlogs-section-header">
                    <span className="vlogs-section-title">Explore Travel Vlogs</span>
                    <span className="vlogs-section-badge-pulsing">VLOGS</span>
                  </div>

                  <div className="vlogs-scroll-container">
                    {vlogs.map((vlog) => (
                      <div 
                        key={vlog.id} 
                        className="vlog-feed-card spring-active"
                        onMouseEnter={() => setHoveredVlogId(vlog.id)}
                        onMouseLeave={() => setHoveredVlogId(null)}
                      >
                        {/* Vlog Header */}
                        <div className="vlog-card-header">
                          <div className="vlog-user-info">
                            <span className="vlog-avatar">
                              <img src={vlog.avatar} alt={vlog.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </span>
                            <div className="vlog-user-details">
                              <span className="vlog-username">{vlog.username}</span>
                              <span className="vlog-location">📍 {vlog.location}</span>
                            </div>
                          </div>
                          <span className="vlog-duration-badge">{vlog.duration}</span>
                        </div>

                        {/* Vlog Thumbnail Media */}
                        <div className="vlog-media-container" onClick={() => showToast(`Opening Vlog Player: Solo Trekking...`)}>
                          <img src={vlog.thumbnail} alt={vlog.title} className="vlog-img" />
                          <div className="vlog-play-overlay">
                            <div className="vlog-play-button">
                              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {hoveredVlogId === vlog.id && (
                            <div className="vlog-playback-progress-bar-container">
                              <div className="vlog-playback-progress-bar-fill"></div>
                            </div>
                          )}
                        </div>

                        {/* Vlog Details */}
                        <div className="vlog-caption-section">
                          <p className="vlog-title-text">{vlog.title}</p>
                          <div className="vlog-metrics-row">
                            <span className="vlog-views">
                              {viewCounts[vlog.id] !== undefined ? `${(viewCounts[vlog.id] / 1000).toFixed(1)}K views` : vlog.views}
                            </span>
                            <button 
                              className={`vlog-like-btn spring-active ${vlog.liked ? 'liked' : ''}`} 
                              onClick={() => {
                                toggleLikeVlog(vlog.id);
                                if (!vlog.liked) {
                                  showToast(`Liked @${vlog.username}'s vlog`);
                                }
                              }}
                            >
                              <svg width="12" height="12" fill={vlog.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {likeCounts[vlog.id] !== undefined ? likeCounts[vlog.id] : vlog.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: REELS (DESKTOP ALIGNED) */}
            {activeTab === 'reels' && (
              <div className="reels-desktop-layout" onWheel={handleReelsWheel}>
                {/* Refresh Overlay / Spinner */}
                {isRefreshing && (
                  <div className="reels-refresh-spinner-popup">
                    <svg className="reels-refresh-spinner" viewBox="0 0 50 50">
                      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="currentColor"></circle>
                    </svg>
                    <span>Refreshing feed...</span>
                  </div>
                )}

                {/* Refresh Toast Confirmation */}
                {showRefreshToast && (
                  <div className="reels-refresh-toast">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: '#10b981' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Feed refreshed!</span>
                  </div>
                )}

                {/* Slidable track container for smooth vertical animation */}
                <div 
                  className="reels-track" 
                  style={{ 
                    transform: `translateY(-${activeReelIndex * 100}%)`
                  }}
                >
                  {reels.map((reel, rIdx) => {
                    const isLiked = likedReels.has(reel.id);
                    const isSaved = savedReels.has(reel.id);
                    const isFollowing = followedUsers.has(reel.username);

                    return (
                      <div 
                        className="reels-center-wrapper" 
                        key={reel.id}
                        style={{
                          opacity: rIdx === activeReelIndex ? 1 : 0.3,
                          transform: `scale(${rIdx === activeReelIndex ? 1 : 0.95})`,
                          transition: 'opacity 0.5s ease, transform 0.5s ease',
                          pointerEvents: rIdx === activeReelIndex ? 'auto' : 'none'
                        }}
                      >
                        
                        {/* Inner Centered Container to anchor left details and right actions */}
                        <div className="reels-inner-container">

                          {/* Left Column: Creator details & Caption (Desktop-only, hidden on mobile via CSS) */}
                          <div className="reels-details-left-side">
                            <div className="reels-details-left-container">
                              
                              <div className="reel-user-row-new">
                                <div className="reel-user-avatar-new" onClick={() => openUserProfile(reel.username)} style={{ cursor: 'pointer' }}>
                                  {renderAvatar(reel.username, 36)}
                                </div>
                                <div className="reel-user-name-info">
                                  <span className="reel-username-new" onClick={() => openUserProfile(reel.username)} style={{ cursor: 'pointer' }}>
                                    {reel.username}
                                  </span>
                                  <span className="reel-bullet-separator">•</span>
                                  <FollowButton
                                    isFollowing={isFollowing}
                                    onToggle={() => toggleFollowUser(reel.username)}
                                  />
                                </div>
                              </div>

                              <div className="reel-caption-container-new">
                                <p className="reel-caption-new">
                                  {reel.caption}
                                </p>
                              </div>

                              <div className="reel-soundtrack-new">
                                <svg className="music-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                                <div className="music-text-scroll-container">
                                  <span className="music-text-scroll">{reel.soundtrack}</span>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Middle Column: Immersive Video Card */}
                          <div className="reels-desktop-card" style={{ background: reel.imageGradient }}>
                            <div className="reel-gradient-overlay" />
                            
                            {/* Play/Pause overlay button indicator */}
                            <div className="reel-play-indicator-overlay">
                              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            
                            {/* Mobile overlay details (Visible only on mobile/tablet via CSS) */}
                            <div className="reel-mobile-overlay-details">
                              <div className="reel-user-row-new">
                                {renderAvatar(reel.username, 32)}
                                <span className="reel-username-new">{reel.username}</span>
                                <span className="reel-bullet-separator">•</span>
                                <FollowButton
                                  isFollowing={isFollowing}
                                  onToggle={() => toggleFollowUser(reel.username)}
                                />
                              </div>
                              <p className="reel-caption-new">{reel.caption}</p>
                              <div className="reel-soundtrack-new">
                                <svg className="music-icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18V5l12-2v13"></path>
                                  <circle cx="6" cy="18" r="3"></circle>
                                  <circle cx="18" cy="16" r="3"></circle>
                                </svg>
                                <span>{reel.soundtrack}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Interaction Action Buttons */}
                          <div className="reels-desktop-actions-column-new">
                            
                            {/* Like Button */}
                            <div className="reel-action-item">
                              <button 
                                className={`reels-action-circle-btn-new ${isLiked ? 'liked' : ''}`} 
                                onClick={() => toggleLikeReel(reel.id)} 
                                title={isLiked ? "Unlike" : "Like"}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                              <span className="reel-action-count">{formatCount(reel.likes)}</span>
                            </div>

                            {/* Comment Button */}
                            <div className="reel-action-item">
                              <button 
                                className="reels-action-circle-btn-new" 
                                onClick={() => alert('Comments drawer open')} 
                                title="Comment"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                              </button>
                              <span className="reel-action-count">{formatCount(reel.comments)}</span>
                            </div>

                            {/* Share Button */}
                            <div className="reel-action-item">
                              <button 
                                className="reels-action-circle-btn-new" 
                                onClick={() => alert('Copied Reel link!')} 
                                title="Share"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-20deg) translate(0px, 1px)', transformOrigin: 'center' }}>
                                  <line x1="22" y1="2" x2="11" y2="13" />
                                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                              </button>
                              <span className="reel-action-count" style={{ display: 'none' }}>Share</span>
                            </div>

                            {/* Save / Bookmark Button */}
                            <div className="reel-action-item">
                              <button 
                                className={`reels-action-circle-btn-new ${isSaved ? 'saved' : ''}`} 
                                onClick={() => toggleSaveReel(reel.id)} 
                                title={isSaved ? "Unsave" : "Save"}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                              </button>
                              <span className="reel-action-count" style={{ display: 'none' }}>Save</span>
                            </div>

                            {/* More Options Button */}
                            <div className="reel-action-item">
                              <button 
                                className="reels-action-circle-btn-new" 
                                onClick={() => alert('Options drawer open')} 
                                title="More options"
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                  <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                                  <circle cx="18" cy="12" r="1.5" fill="currentColor" />
                                </svg>
                              </button>
                            </div>

                            {/* Rotating Audio Icon */}
                            <div className="reel-audio-vinyl-wrapper" title="Audio track">
                              <div className="reel-audio-avatar-square">
                                {renderAvatar(reel.username, 24)}
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Fixed Navigation Column at right middle edge of screen */}
                <div className="reels-navigation-column">
                  <button 
                    className="reels-nav-arrow-new" 
                    onClick={handlePrevReel}
                    title="Previous Reel (Scroll up / Pull to refresh)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button 
                    className="reels-nav-arrow-new" 
                    onClick={handleNextReel}
                    title="Next Reel (Scroll down)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: INBOX MESSAGES (DESKTOP LAYOUT) */}
            {activeTab === 'messages' && (
              <div className="messages-desktop-layout">
                {/* Mesmerizing Background Glows */}
                <div className="messages-bg-glow-1"></div>
                <div className="messages-bg-glow-2"></div>
                
                {/* 1. Inbox sidebar chat list */}
                <div className="messages-list-pane">
                  


                  {/* Search Inbox bar */}
                  <div className="inbox-search-container">
                    <div className="search-input-wrapper inbox-search-wrapper">
                      <span className="inbox-search-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </span>
                      <input type="text" placeholder="Search chats" className="comment-input" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%', padding: 0 }} />
                    </div>
                  </div>

                  {/* Notes bubble strip */}
                  <div className="messages-notes-strip">
                    <div className="messages-note-item">
                      <div className="messages-note-bubble">Your note</div>
                      <div className="messages-note-avatar-container">
                        {renderAvatar(user.username, 44)}
                        <div className="messages-note-badge">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </div>
                      </div>
                      <span className="messages-note-username">Your note</span>
                    </div>
                    <div className="messages-note-item" onClick={() => alert('Campfire talks note!')}>
                      <div className="messages-note-bubble">Trekking...</div>
                      {renderAvatar('backpacker_sam', 44)}
                      <span className="messages-note-username">sam</span>
                    </div>
                    <div className="messages-note-item" onClick={() => alert('Rice fields vlogs note!')}>
                      <div className="messages-note-bubble">Bali vibe!</div>
                      {renderAvatar('wanderlust_jenny', 44)}
                      <span className="messages-note-username">jenny</span>
                    </div>
                  </div>

                  {/* Chat users list */}
                  <div className="inbox-users-list">
                    {Object.keys(conversations).map((buddy) => (
                      <div 
                        key={buddy}
                        className={`inbox-user-item ${activeChatBuddy === buddy ? 'active' : ''}`}
                        onClick={() => handleSwitchActiveChat(buddy)}
                      >
                        {renderAvatar(buddy, 40)}
                        <div className="inbox-user-info-row">
                          <div className="inbox-user-name">@{buddy.split('_')[1] || buddy}</div>
                          <div className="inbox-user-status-container" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span className="status-pulse-dot"></span>
                            <span className="inbox-user-status">Active now</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* 2. Main Chat dialog area */}
                <div className={`messages-chat-pane ${isSwitchingChat ? 'glass-switching' : ''}`}>
                  
                  {/* Chat header */}
                  <div className="chat-window-header">
                    {renderAvatar(activeChatBuddy, 36)}
                    <div className="chat-header-user-info">
                      <div className="chat-header-username">@{activeChatBuddy}</div>
                      <span className="chat-header-status">Active 5m ago</span>
                    </div>
                    
                    <div className="chat-header-actions">
                      <button className="chat-header-btn" onClick={() => alert('Starting voice call...')} title="Audio Call">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </button>
                      <button className="chat-header-btn" onClick={() => alert('Starting video chat...')} title="Video Call">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 7l-7 5 7 5V7z"></path>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                      </button>
                      <button className="chat-header-btn" onClick={() => alert('Chat Details details')} title="Details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages container */}
                  <div className="inbox-chat-messages">
                    {(conversations[activeChatBuddy] || []).map((msg, mIdx) => (
                      <div 
                        key={mIdx}
                        className={`inbox-chat-bubble ${msg.sender === 'me' ? 'me' : 'them'}`}
                      >
                        <div>{msg.text}</div>
                        <span className="inbox-chat-bubble-time">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chat inputs footer */}
                  <div className="inbox-chat-footer">
                    <form className={`inbox-chat-input-bar ${isSwitchingChat ? 'glass-switching' : ''}`} onSubmit={handleSendMessage}>
                      <button type="button" className="inbox-input-action-btn" onClick={() => alert('Opening emoji picker...')} title="Emoji">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                      </button>
                      <input 
                        type="text" 
                        className="inbox-chat-input" 
                        placeholder="Message..." 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                      />
                      <button type="button" className="inbox-input-action-btn" onClick={() => alert('Select photo/media')} title="Attach Photo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </button>
                      <button type="submit" className="inbox-chat-send-btn" disabled={!chatInput.trim()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </form>
                  </div>

                </div>

                {/* 3. Right Details Column */}
                <aside className={`messages-details-pane ${isSwitchingChat ? 'glass-switching' : ''}`}>
                  {renderAvatar(activeChatBuddy, 72)}
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '16px', fontFamily: 'var(--font-title)' }}>@{activeChatBuddy}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px' }}>Travel Buddy</span>

                  <div className="inbox-details-media-section">
                    <h5 className="inbox-details-media-title">Shared Media</h5>
                    <div className="attachments-grid">
                      <div className="attachment-card" onClick={() => alert('Viewing Ubud shared card')}>
                        <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200&auto=format&fit=crop&q=80" alt="ubud" />
                      </div>
                      <div className="attachment-card" onClick={() => alert('Viewing Solang shared card')}>
                        <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=200&auto=format&fit=crop&q=80" alt="solang" />
                      </div>
                    </div>
                  </div>
                </aside>

              </div>
            )}

            {/* VIEW 4: EXPLORE SEARCH GRID */}
            {activeTab === 'search' && (
              <div 
                className="discover-page-container"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--discover-mouse-x', `${x}px`);
                  e.currentTarget.style.setProperty('--discover-mouse-y', `${y}px`);
                }}
              >
                {/* Cursor-reactive ambient background glow */}
                <div 
                  className="cursor-reactive-glow"
                ></div>

                {/* Corner vignette glows */}
                <div className="discover-corner-glow glow-topleft"></div>
                <div className="discover-corner-glow glow-bottomright"></div>

                {/* Explore Search Header Row with Action Buttons */}
                <div className="explore-search-header-row">
                  <div className="instagram-explore-search-bar" onClick={() => { setShowCommandPalette(true); playUISound('open'); }}>
                    <div className="search-input-wrapper explore-search-input-wrapper">
                      {/* App Logo */}
                      <div className="explore-search-logo-container" title="Travora">
                        <Logo theme={theme} width={22} showText={false} />
                      </div>
                      {/* SVG Search Icon */}
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="explore-search-svg-icon"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input 
                        type="text" 
                        readOnly
                        className="comment-input explore-search-field"
                        placeholder="Search romantic beach getaways..."
                        value={searchQuery}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', marginLeft: '10px', cursor: 'pointer' }}
                      />
                      <span className="search-hotkey-badge">⌘K</span>
                    </div>
                  </div>

                  {/* Quick Action controls to the right of the Search Bar */}
                  <div className="explore-search-actions">
                    {/* Sound Toggle controls */}
                    <button 
                      type="button" 
                      className={`explore-action-btn sound-toggle-btn ${soundEnabled ? 'active' : ''}`}
                      onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        if (next) {
                          // synthesize visual confirmation tick
                          try {
                            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            osc.frequency.setValueAtTime(600, ctx.currentTime);
                            gain.gain.setValueAtTime(0.015, ctx.currentTime);
                            osc.start();
                            osc.stop(ctx.currentTime + 0.1);
                          } catch(err) {}
                        }
                      }}
                      title={soundEnabled ? "Disable UI Sounds" : "Enable UI Sounds"}
                    >
                      <span className="action-icon-wrapper-sound">
                        {soundEnabled ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                          </svg>
                        )}
                      </span>
                      <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
                    </button>

                    <button 
                      className={`explore-action-btn ${showFilters ? 'active' : ''}`}
                      onClick={() => { playUISound('click'); setShowFilters(!showFilters); }} 
                      title="Advanced Filters"
                      onMouseEnter={() => playUISound('hover')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                      <span>Filters</span>
                    </button>
                    <button 
                      className={`explore-action-btn ${showMapView ? 'active' : ''}`}
                      onClick={() => { playUISound('click'); setShowMapView(!showMapView); }} 
                      title="Map View"
                      onMouseEnter={() => playUISound('hover')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                        <line x1="9" y1="3" x2="9" y2="18" />
                        <line x1="15" y1="6" x2="15" y2="21" />
                      </svg>
                      <span>Map View</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Horizontal Scrollbar */}
                <div className="explore-categories-scroll-wrapper">
                  <div className="explore-categories-container" ref={categoriesContainerRef}>
                    <div className="explore-active-indicator" style={activeCategoryStyle}>
                      <div className="explore-active-indicator-glow" />
                      <div className="explore-active-indicator-highlight" />
                      <div className="explore-active-indicator-reflection" />
                    </div>
                    {[
                      'All',
                      'Mountains',
                      'Beaches',
                      'Tropical',
                      'Cities',
                      'Winter',
                      'Cultural'
                    ].map((catName) => (
                      <button
                        key={catName}
                        className={`explore-category-btn ${activeExploreCategory === catName ? 'active' : ''} ${scalingActiveBtn === catName ? 'scale-bump' : ''}`}
                        onClick={() => handleSwitchExploreCategory(catName)}
                        onMouseEnter={() => playUISound('hover')}
                      >
                        <span className="explore-category-icon-svg">
                          {renderCategoryIcon(catName)}
                        </span>
                        <span className="explore-category-name">{catName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Filters Expandable Card */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden', marginBottom: '20px' }}
                    >
                      <div className="discover-premium-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        {/* Price Range Filter */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>MAX NIGHTLY PRICE: ${filterPriceMax}</label>
                          <input 
                            type="range" 
                            min="100" 
                            max="500" 
                            step="20"
                            value={filterPriceMax} 
                            onChange={(e) => setFilterPriceMax(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <span>$100</span>
                            <span>$500</span>
                          </div>
                        </div>

                        {/* Minimum Rating Filter */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>MINIMUM RATING</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[null, 4.0, 4.5, 4.8].map((stars) => (
                              <button
                                key={stars === null ? 'any' : stars}
                                onClick={() => setFilterRating(stars)}
                                style={{
                                  flex: 1,
                                  padding: '6px 0',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: filterRating === stars ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  borderRadius: '6px',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                              >
                                {stars === null ? 'Any' : `${stars}★`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Amenities Filter */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>AMENITIES</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {['Free WiFi', 'Swimming Pool', 'Ocean View', 'Kitchen', 'Gym', 'Spa'].map((am) => {
                              const active = filterAmenities.includes(am);
                              return (
                                <button
                                  key={am}
                                  onClick={() => {
                                    setFilterAmenities(prev => 
                                      prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am]
                                    );
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: active ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.02)',
                                    border: active ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.04)',
                                    borderRadius: '6px',
                                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {am}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Living Morphing Hero Banner */}
                <div 
                  className="explore-popular-hero-card discover-premium-card" 
                  onMouseEnter={() => setIsHeroHovered(true)} 
                  onMouseLeave={() => setIsHeroHovered(false)}
                  onClick={() => {
                    setSearchQuery(heroDestinations[heroIndex].name.split(',')[0]);
                    playUISound('tap');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="explore-popular-hero-bg-wrapper">
                    {heroDestinations.map((dest, idx) => (
                      <img 
                        key={dest.name}
                        src={dest.img} 
                        alt={dest.name} 
                        className={`explore-popular-hero-bg ${heroIndex === idx ? 'visible' : ''}`}
                      />
                    ))}
                    <div className="explore-popular-hero-gradient-overlay" />
                  </div>
                  
                  <div className="explore-popular-hero-badge">
                    <span className="explore-badge-pulse" />
                    <span className="pulse-ripple-wave"></span>
                    <span className="badge-text-glow">⚡ LIVE TRENDING OF TODAY</span>
                  </div>
                  
                  <div className="explore-popular-hero-content-glass">
                    <div className="explore-popular-hero-text">
                      <h4 className="explore-popular-hero-title">
                        {heroDestinations[heroIndex].name}
                      </h4>
                      <p className="explore-popular-hero-desc">
                        {heroDestinations[heroIndex].desc}
                      </p>
                    </div>
                    
                    <div className="explore-popular-hero-stats">
                      <div className="explore-hero-stat-item">
                        <span className="explore-hero-stat-label">DAILY VISITORS</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="live-stat-dot-pulse"></span>
                          <span className="explore-hero-stat-value count-up">
                            {heroDestinations[heroIndex].visitors}
                          </span>
                        </div>
                      </div>
                      <div className="explore-hero-stat-divider" />
                      <div className="explore-hero-stat-item">
                        <span className="explore-hero-stat-label">RATING</span>
                        <span className="explore-hero-stat-value count-up">
                          {heroDestinations[heroIndex].rating} <span style={{ color: '#f59e0b', fontSize: '9px' }}>{heroDestinations[heroIndex].stars}</span>
                        </span>
                      </div>
                      <button className="explore-hero-cta-btn btn-shimmer-sweep">
                        Explore
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '24px 0 16px', fontFamily: 'var(--font-title)', letterSpacing: '-0.3px', background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Trending Destinations</h3>
                
                {(() => {
                  const processedDestinations = baseDestinations;

                  const sidebarDestinations = baseDestinations.filter(dest => {
                    return !showMapView || visibleDestinationNames.length === 0 || visibleDestinationNames.includes(dest.name);
                  });

                  if (showMapView) {
                    return (
                      <div style={{ display: 'flex', gap: '20px', height: '550px', marginTop: '16px' }}>
                        {/* Left List Pane */}
                        <div style={{ width: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                          {sidebarDestinations.map((dest, idx) => {
                            const isHovered = hoveredDestinationName === dest.name;
                            const isSelected = selectedDestinationName === dest.name;
                            return (
                              <div 
                                key={idx} 
                                className="discover-premium-card animate-slide-up" 
                                style={{ 
                                  padding: '12px', 
                                  borderRadius: '12px', 
                                  display: 'flex', 
                                  gap: '12px', 
                                  alignItems: 'center', 
                                  background: isSelected ? 'rgba(236,72,153,0.1)' : 'var(--card-bg)', 
                                  borderColor: isSelected ? 'var(--primary)' : isHovered ? 'rgba(255,255,255,0.15)' : 'var(--card-border)',
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={() => setHoveredDestinationName(dest.name)}
                                onMouseLeave={() => setHoveredDestinationName(null)}
                                onClick={() => {
                                  setSelectedDestinationName(dest.name);
                                }}
                              >
                                <img src={dest.img} alt={dest.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dest.name}</h4>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>${dest.price}/night • {dest.ratingNum}★</span>
                                  <span style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: 600 }}>{dest.category}</span>
                                </div>
                              </div>
                            );
                          })}
                          {sidebarDestinations.length === 0 && (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No matches found in this region.</div>
                          )}
                        </div>
 
                        {/* Right Interactive Map Pane */}
                        <div className="discover-premium-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#09080f', border: '1px solid var(--card-border)', display: 'flex', height: '100%', width: '100%' }}>
                          <InteractiveMap 
                            destinations={baseDestinations}
                            hoveredDestinationName={hoveredDestinationName}
                            selectedDestinationName={selectedDestinationName}
                            onDestinationSelect={(name) => {
                              const dest = travelDestinations.find(d => d.name === name);
                              if (dest) {
                                setLightboxImage(dest.img);
                                setSelectedDestinationName(name);
                              }
                            }}
                            onVisibleDestinationsChange={(names) => {
                              setVisibleDestinationNames(names);
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div 
                      className={`instagram-explore-grid ${isSwitchingCategory ? 'glass-switching' : ''} ${!hasEverSwitchedCategory ? 'no-animate' : ''}`}
                      style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {processedDestinations.map((dest, idx) => {
                        const totalLikes = 120 + (liveUpticks[idx] || 0);
                        return (
                          <div 
                            key={idx} 
                            className="instagram-explore-item-card discover-premium-card"
                            onMouseMove={(e) => {
                              const card = e.currentTarget;
                              const rect = card.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              const xc = rect.width / 2;
                              const yc = rect.height / 2;
                              const angleX = (yc - y) / 12;
                              const angleY = (x - xc) / 12;
                              card.style.transform = `perspective(800px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
                              const glare = card.querySelector('.card-glare-overlay') as HTMLElement;
                              if (glare) {
                                glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.08) 0%, transparent 60%)`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              const card = e.currentTarget;
                              card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                              const glare = card.querySelector('.card-glare-overlay') as HTMLElement;
                              if (glare) {
                                glare.style.background = 'transparent';
                              }
                            }}
                            onClick={() => {
                              setSearchQuery(dest.name.split(',')[0]);
                              playUISound('tap');
                            }}
                          >
                            <div className="card-glare-overlay"></div>
                            <div className="explore-item-image-wrapper">
                              <img src={dest.img} alt={dest.name} className="explore-item-image" />
                              <div className="explore-item-gradient-overlay" />
                            </div>
                            <div className="explore-item-floating-header">
                              <span className="explore-item-category-badge">{dest.category}</span>
                              <span className="explore-live-pulse-badge">
                                <span className="pulse-dot-red"></span>
                                <span>{8 + (idx * 3)} viewing</span>
                              </span>
                            </div>
                            <div className="explore-item-footer-glass">
                              <div className="explore-item-info">
                                <span className="explore-item-name">{dest.name}</span>
                                <span className="explore-item-count" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                                  ${dest.price}/night • {dest.ratingNum}★
                                </span>
                              </div>
                              <div className="explore-item-stats">
                                <div 
                                  className={`explore-item-stat-pill ${liveUpticks[idx] ? 'stat-uptick-pulse' : ''}`} 
                                  title="Likes"
                                  onClick={(e) => { e.stopPropagation(); playUISound('tap'); }}
                                >
                                  <svg width="11" height="11" fill="currentColor" style={{ color: '#ec4899', marginRight: '2px' }} viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                  </svg>
                                  <span className="stat-count-text">{totalLikes}</span>
                                </div>
                                <div className="explore-item-stat-pill" title="Comments">
                                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }} viewBox="0 0 24 24">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                  </svg>
                                  <span>{3 + (idx * 2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {processedDestinations.length === 0 && (
                        <div className="explore-empty-state-glass">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                          </svg>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>No destinations found</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Try searching for a different keyword or category.</div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Command-K style AI Search Palette Overlay Modal */}
                {showCommandPalette && (
                  <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
                    <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
                      <div className="command-palette-header">
                        <svg className="palette-search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                          type="text" 
                          className="command-palette-input"
                          placeholder={`Search '${typedText}'`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <span className="command-palette-close-badge" onClick={() => setShowCommandPalette(false)}>ESC</span>
                      </div>
                      
                      <div className="command-palette-results">
                        <div className="palette-section-title">MATCHING EXPLORE DESTINATIONS</div>
                        {travelDestinations
                          .filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((dest, idx) => (
                            <div 
                              key={idx}
                              className="palette-result-item"
                              onClick={() => {
                                setSearchQuery(dest.name.split(',')[0]);
                                setShowCommandPalette(false);
                                playUISound('tap');
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="palette-pin">📍</span>
                                <span className="result-name">{dest.name}</span>
                              </div>
                              <span className="result-category">{dest.category}</span>
                            </div>
                          ))}
                        {travelDestinations.filter(dest => dest.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="palette-no-results">No matching destinations found. Press ESC to close.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: CREATE POST (REDESIGNED 3-COLUMN SOCIAL SCHEDULING DASHBOARD) */}
            {activeTab === 'create' && createChoice === 'none' && (
              <div className="creator-choice-container animate-fade-in" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '500px' }}>
                <h2 className="form-title" style={{ marginBottom: '8px', fontSize: '24px', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)' }}>Start Creating</h2>
                <p className="form-subtitle" style={{ marginBottom: '32px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>Choose the type of travel update you want to share with your audience.</p>
                
                <div className="creator-choice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '640px' }}>
                  {/* Option 1: Create Post */}
                  <div 
                    className="creation-choice-card discover-premium-card hover-glow"
                    onClick={() => setCreateChoice('post')}
                    style={{ cursor: 'pointer', padding: '32px 24px', borderRadius: '16px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}
                  >
                    <div className="choice-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Create Travel Post</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Upload photos or videos, write descriptions, and schedule posts.</p>
                    </div>
                  </div>

                  {/* Option 2: Go Live */}
                  <div 
                    className="creation-choice-card discover-premium-card hover-glow"
                    onClick={() => {
                      setActiveTab('live-studio');
                      setCreateChoice('none');
                      setLiveStep(1);
                      setLiveTitle('');
                      setLiveDescription('');
                      setLiveThumbnail('');
                      setLiveSource('webcam');
                      setStreamStatus('connecting');
                    }}
                    style={{ cursor: 'pointer', padding: '32px 24px', borderRadius: '16px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}
                  >
                    <div className="choice-icon-wrapper animate-pulse-slow" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                      </svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Go Live Studio</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Start a live broadcast or configure an encoder to stream to followers.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'create' && createChoice === 'post' && (
              <div className="creator-dashboard-wrapper">
                <header className="creator-dashboard-header">
                  <div className="header-left">
                    <button onClick={() => setCreateChoice('none')} className="creator-change-choice-btn" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', padding: 0 }}>
                      ← Change creation type
                    </button>
                    <h2 className="creator-dashboard-title">Create Travel Post</h2>
                    <p className="creator-dashboard-subtitle">Craft, organize, and schedule your next travel story effortlessly.</p>
                  </div>
                  <div className="header-right">
                    <div className="breadcrumb-nav">
                      <span className="breadcrumb-item">Dashboard</span>
                      <span className="breadcrumb-arrow">/</span>
                      <span className="breadcrumb-item">Content List</span>
                      <span className="breadcrumb-arrow">/</span>
                      <span className="breadcrumb-item active">Create Post</span>
                    </div>
                  </div>
                </header>

                {/* Unified Stepper Progress Bar */}
                <div className="creator-stepper-container">
                  {[
                    { number: 1, label: 'Upload Media' },
                    { number: 2, label: 'Post Details' },
                    { number: 3, label: 'Settings & Schedule' },
                    { number: 4, label: 'Review & Publish' }
                  ].map((step, idx) => {
                    const isCompleted = currentStep > step.number;
                    const isActive = currentStep === step.number;
                    
                    return (
                      <React.Fragment key={step.number}>
                        <div 
                          className={`stepper-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => {
                            if (isCompleted || step.number <= currentStep + 1) {
                              goToStep(step.number as any);
                            }
                          }}
                        >
                          <div className="stepper-circle">
                            {isCompleted ? (
                              <svg className="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              step.number
                            )}
                          </div>
                          <span className="stepper-label">{step.label}</span>
                        </div>
                        {idx < 3 && (
                          <div className={`stepper-line ${currentStep > step.number ? 'completed' : ''}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="creator-dashboard-layout">
                  {/* Left/Center Column: Wizard Step Card */}
                  <div className={`creator-step-main-column ${isStepChanging ? 'exiting' : 'entering'}`}>
                    
                    {/* STEP 1: UPLOAD MEDIA */}
                    {currentStep === 1 && (
                      <div className="creator-glass-card media-panel-card animate-fade-in">
                        <div className="panel-header">
                          <h3 className="panel-title">Upload Media</h3>
                          <p className="panel-desc">Share photos or a video to attach to your post.</p>
                        </div>
                        
                        {/* Drag & Drop zone */}
                        <div 
                          className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const files = Array.from(e.dataTransfer.files);
                            handleMediaUpload(files);
                          }}
                        >
                          <input 
                            type="file" 
                            id="media-upload-input" 
                            multiple 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              if (e.target.files) {
                                handleMediaUpload(Array.from(e.target.files));
                              }
                            }}
                          />
                          <label htmlFor="media-upload-input" className="upload-label">
                            <div className="upload-icon-wrapper">
                              <svg className="upload-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <span className="upload-title">Click to upload or drag & drop</span>
                            <span className="upload-subtitle">Image, video, carousel</span>
                          </label>
                        </div>

                        <div className="media-library-header">
                          <span className="library-title">Media Library</span>
                          <span className="library-count">All ({mediaLibrary.length})</span>
                        </div>

                        {/* Media library grid */}
                        <div className="media-library-grid">
                          <label htmlFor="media-upload-input" className="library-add-btn">
                            <span className="add-plus-symbol">+</span>
                          </label>

                          {mediaLibrary.map((item) => {
                            const isSelected = postImages.includes(item.url);
                            return (
                              <div 
                                key={item.id} 
                                className={`media-library-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleMediaSelection(item.url)}
                              >
                                <img src={item.url} alt={item.name} className="library-item-img" />
                                <div className="item-selection-overlay">
                                  <span className="selection-checkbox">
                                    {isSelected && (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                      </svg>
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Attached Media List with details & reordering */}
                        <div className="attached-media-section">
                          <span className="section-label">Selected Media ({postImages.length})</span>
                          {postImages.length === 0 ? (
                            <div className="no-attached-media">No media attached to post. Select from library or upload.</div>
                          ) : (
                            <div className="attached-media-list">
                              {postImages.map((imgUrl, index) => {
                                const libItem = mediaLibrary.find(item => item.url === imgUrl) || {
                                  name: `uploaded_image_${index + 1}.jpg`,
                                  size: '1.4 MB',
                                  dimensions: '1326x1326'
                                };
                                return (
                                  <div key={imgUrl} className="attached-media-item">
                                    <div className="attached-item-left">
                                      <div className="reorder-controls">
                                        <button 
                                          type="button" 
                                          className="reorder-btn" 
                                          disabled={index === 0}
                                          onClick={(e) => { e.stopPropagation(); moveMedia(index, -1); }}
                                          title="Move Up"
                                        >
                                          ▲
                                        </button>
                                        <button 
                                          type="button" 
                                          className="reorder-btn" 
                                          disabled={index === postImages.length - 1}
                                          onClick={(e) => { e.stopPropagation(); moveMedia(index, 1); }}
                                          title="Move Down"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <img src={imgUrl} alt="Attached Preview" className="attached-item-thumbnail" />
                                      <div className="attached-item-info">
                                        <span className="item-filename">{libItem.name}</span>
                                        <span className="item-meta">{libItem.dimensions} • {libItem.size}</span>
                                      </div>
                                    </div>
                                    <div className="attached-item-actions">
                                      <button 
                                        type="button" 
                                        className="media-item-action-btn delete-btn" 
                                        onClick={() => toggleMediaSelection(imgUrl)}
                                        title="Remove from post"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Navigation Row */}
                        <div style={{ marginTop: '24px' }}>
                          <button 
                            type="button" 
                            className="creator-action-btn btn-publish"
                            disabled={postImages.length === 0}
                            onClick={() => goToStep(2)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          >
                            Next: Post Details
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: POST DETAILS */}
                    {currentStep === 2 && (
                      <div className="creator-glass-card editor-form-card animate-fade-in">
                        <div className="panel-header">
                          <h3 className="panel-title">Post Details</h3>
                          <p className="panel-desc">Define target platform, title, location, caption, and categories.</p>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="editor-form">
                          {/* Platform Selector Pills */}
                          <div className="form-section">
                            <label className="section-label">Platform Destination</label>
                            <div className="platform-selector">
                              {(['Feed', 'Stories', 'Community', 'Highlights'] as const).map((platform) => (
                                <button
                                  key={platform}
                                  type="button"
                                  className={`platform-pill ${selectedPlatform === platform ? 'active' : ''}`}
                                  onClick={() => setSelectedPlatform(platform)}
                                >
                                  <span className="platform-icon">
                                    {platform === 'Feed' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="4" />
                                      </svg>
                                    )}
                                    {platform === 'Stories' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                                      </svg>
                                    )}
                                    {platform === 'Community' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                      </svg>
                                    )}
                                    {platform === 'Highlights' && (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                      </svg>
                                    )}
                                  </span>
                                  {platform}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Title field */}
                          <div className="form-group">
                            <label className="form-label" htmlFor="post-title-input">Title</label>
                            <input 
                              type="text" 
                              id="post-title-input" 
                              className="form-input-premium" 
                              placeholder="Austria: Panoramic Lake" 
                              value={postTitle}
                              onChange={(e) => setPostTitle(e.target.value)}
                              required
                            />
                          </div>

                          {/* Location autocomplete */}
                          <div className="form-group location-autocomplete-container">
                            <label className="form-label" htmlFor="post-location-input">Location</label>
                            <div className="form-input-with-icon">
                              <span className="input-icon">📍</span>
                              <input 
                                type="text" 
                                id="post-location-input" 
                                className="form-input-premium" 
                                placeholder="Where was this photo taken?" 
                                value={newPostLocation}
                                onChange={(e) => {
                                  setNewPostLocation(e.target.value);
                                  setLocationSuggestionsExpanded(true);
                                }}
                                onFocus={() => setLocationSuggestionsExpanded(true)}
                                required
                              />
                            </div>
                            
                            {locationSuggestionsExpanded && newPostLocation && (
                              <div className="autocomplete-suggestions">
                                {travelDestinations
                                  .filter(dest => dest.name.toLowerCase().includes(newPostLocation.toLowerCase()))
                                  .map((dest) => (
                                    <div 
                                      key={dest.name} 
                                      className="autocomplete-item"
                                      onClick={() => {
                                        setNewPostLocation(dest.name);
                                        setLocationSuggestionsExpanded(false);
                                      }}
                                    >
                                      <span className="suggestion-icon">📍</span>
                                      <span className="suggestion-name">{dest.name}</span>
                                    </div>
                                  ))}
                                <div 
                                  className="autocomplete-item custom-add"
                                  onClick={() => setLocationSuggestionsExpanded(false)}
                                >
                                  <span className="suggestion-icon">➕</span>
                                  <span className="suggestion-name">Use custom: "{newPostLocation}"</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Caption Textarea */}
                          <div className="form-group">
                            <div className="label-row">
                              <label className="form-label" htmlFor="post-caption-input">Caption</label>
                              <span className="char-count">{newPostCaption.length} / 2200</span>
                            </div>
                            <textarea 
                              id="post-caption-input" 
                              className="form-input-premium form-textarea-premium" 
                              placeholder="Write a caption... (e.g. Scooter rides in Bali rice fields!) #wanderlust"
                              value={newPostCaption}
                              onChange={(e) => setNewPostCaption(e.target.value)}
                              required
                            />
                          </div>

                          {/* Tag travelers */}
                          <div className="form-group">
                            <label className="form-label" htmlFor="friend-tag-input">Tag Travelers / Friends</label>
                            <div className="tag-friends-input-wrapper">
                              <input
                                type="text"
                                id="friend-tag-input"
                                className="form-input-premium"
                                placeholder="Add people by name or username"
                                value={friendInput}
                                onChange={(e) => setFriendInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    const tag = friendInput.trim();
                                    if (tag) {
                                      const formatted = tag.startsWith('@') ? tag : `@${tag}`;
                                      if (!taggedFriends.includes(formatted)) {
                                        setTaggedFriends(prev => [...prev, formatted]);
                                      }
                                      setFriendInput('');
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="tagged-friends-list">
                              {taggedFriends.map(friend => (
                                <span key={friend} className="friend-tag-pill">
                                  {friend}
                                  <button 
                                    type="button" 
                                    className="remove-tag-btn"
                                    onClick={() => setTaggedFriends(prev => prev.filter(f => f !== friend))}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Travel Categories */}
                          <div className="form-group">
                            <label className="form-label">Travel Categories</label>
                            <div className="categories-selection">
                              {['Adventure', 'Food', 'Beaches', 'Mountains', 'Culture'].map(cat => {
                                const isSelected = selectedCategories.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    className={`category-pill ${isSelected ? 'selected' : ''} ${scalingActiveBtn === `cat-${cat}` ? 'scale-bump' : ''}`}
                                    onClick={() => {
                                      setScalingActiveBtn(`cat-${cat}`);
                                      setTimeout(() => setScalingActiveBtn(null), 250);
                                      setSelectedCategories(prev => {
                                        if (prev.includes(cat)) {
                                          return prev.filter(c => c !== cat);
                                        } else {
                                          return [...prev, cat];
                                        }
                                      });
                                    }}
                                  >
                                    {isSelected && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </span>
                                    )}
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Navigation row */}
                          <div className="step-navigation-buttons" style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-draft"
                              onClick={() => goToStep(1)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                              Back
                            </button>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-publish"
                              disabled={!postTitle.trim() || !newPostLocation.trim() || !newPostCaption.trim()}
                              onClick={() => goToStep(3)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              Next: Settings
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* STEP 3: SETTINGS & SCHEDULE */}
                    {currentStep === 3 && (
                      <div className="creator-glass-card editor-form-card animate-fade-in">
                        <div className="panel-header">
                          <h3 className="panel-title">Settings & Schedule</h3>
                          <p className="panel-desc">Configure publication timing, target audience, and syndication options.</p>
                        </div>

                        {/* Cohesive Bordered Card Block for scheduling & configurations */}
                        <div className="creator-inner-glass-card">
                          
                          {/* Schedule Section */}
                          <div className="form-group schedule-form-section">
                            <label className="form-label" style={{ display: 'block', marginBottom: '10px' }}>Schedule Post</label>
                            <div className="scheduler-inputs">
                              <div className="input-group">
                                <span className="scheduler-icon">
                                  {/* Line SVG Calendar */}
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                </span>
                                <input 
                                  type="date" 
                                  className="form-input-premium schedule-date-picker"
                                  value={scheduleDate} 
                                  onChange={(e) => setScheduleDate(e.target.value)}
                                />
                              </div>
                              <div className="input-group">
                                <span className="scheduler-icon">
                                  {/* Line SVG Alarm Clock */}
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                </span>
                                <input 
                                  type="time" 
                                  className="form-input-premium schedule-time-picker"
                                  value={scheduleTime} 
                                  onChange={(e) => setScheduleTime(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Post Visibility */}
                          <div className="form-group" style={{ marginTop: '24px' }}>
                            <label className="form-label">Post Visibility</label>
                            <div className="visibility-options-grid">
                              {[
                                { key: 'public', title: 'Public', desc: 'Anyone on Travora can see this post' },
                                { key: 'followers', title: 'Followers Only', desc: 'Only your active followers can view' },
                                { key: 'private', title: 'Private (Only Me)', desc: 'Hidden completely from other users' }
                              ].map(option => (
                                <label key={option.key} className={`visibility-radio-card ${visibility === option.key ? 'active' : ''}`}>
                                  <input
                                    type="radio"
                                    name="visibility-selection"
                                    value={option.key}
                                    checked={visibility === option.key}
                                    onChange={() => setVisibility(option.key as any)}
                                    className="sr-only"
                                  />
                                  <span className="radio-indicator"></span>
                                  <span className="radio-content">
                                    <span className="radio-title">{option.title}</span>
                                    <span className="radio-description">{option.desc}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Feature Toggles List */}
                          <div className="toggles-list-section" style={{ marginTop: '24px' }}>
                            {/* Allow Comments */}
                            <div className="toggle-switch-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="platform-logo-icon">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                  </svg>
                                </span>
                                <div className="toggle-info">
                                  <span className="toggle-label-title">Allow Comments</span>
                                  <span className="toggle-label-desc">Let followers interact and leave comments on this post</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={allowComments} 
                                  onChange={(e) => setAllowComments(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Cross Post Facebook */}
                            <div className="toggle-switch-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="platform-logo-icon">
                                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                                  </svg>
                                </span>
                                <div className="toggle-info">
                                  <span className="toggle-label-title">Cross-Post to Facebook</span>
                                  <span className="toggle-label-desc">Automatically post to linked Facebook pages</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={crossPostFacebook} 
                                  onChange={(e) => setCrossPostFacebook(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Cross Post Twitter / X */}
                            <div className="toggle-switch-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="platform-logo-icon">
                                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                  </svg>
                                </span>
                                <div className="toggle-info">
                                  <span className="toggle-label-title">Cross-Post to Twitter / X</span>
                                  <span className="toggle-label-desc">Push link and caption updates to your X audience</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={crossPostTwitter} 
                                  onChange={(e) => setCrossPostTwitter(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Cross Post TikTok */}
                            <div className="toggle-switch-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="platform-logo-icon">
                                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.42a7.21 7.21 0 0 0-1-.07 6.33 6.33 0 0 0-.25 12.65 6.18 6.18 0 0 0 5.25-4.26V9.11A7.26 7.26 0 0 0 21 11.72v-3.45a4.88 4.88 0 0 1-1.41-1.58z" />
                                  </svg>
                                </span>
                                <div className="toggle-info">
                                  <span className="toggle-label-title">Cross-Post to TikTok</span>
                                  <span className="toggle-label-desc">Share visual content onto your TikTok profile</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={crossPostTiktok} 
                                  onChange={(e) => setCrossPostTiktok(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Push Notifications */}
                            <div className="toggle-switch-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="platform-logo-icon">
                                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                  </svg>
                                </span>
                                <div className="toggle-info">
                                  <span className="toggle-label-title">Push Notifications</span>
                                  <span className="toggle-label-desc">Alert close friends and top subscribers immediately</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input 
                                  type="checkbox" 
                                  checked={sendNotification} 
                                  onChange={(e) => setSendNotification(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Navigation row */}
                        <div className="step-navigation-buttons" style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                          <button 
                            type="button" 
                            className="creator-action-btn btn-draft"
                            onClick={() => goToStep(2)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back
                          </button>
                          <button 
                            type="button" 
                            className="creator-action-btn btn-publish"
                            onClick={() => goToStep(4)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            Review & Preview
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: REVIEW & PUBLISH */}
                    {currentStep === 4 && (
                      <div className="creator-glass-card editor-form-card animate-fade-in">
                        <div className="panel-header">
                          <h3 className="panel-title">Review & Publish</h3>
                          <p className="panel-desc">Check your live preview on the right and choose how to proceed.</p>
                        </div>

                        <div className="review-summary-details" style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Platform:</span>
                            <span style={{ fontWeight: 600 }}>{selectedPlatform}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                            <span style={{ fontWeight: 600 }}>{newPostLocation || 'None'}</span>
                          </div>
                          {scheduleDate && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Scheduled Date:</span>
                              <span style={{ fontWeight: 600 }}>{scheduleDate} at {scheduleTime}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Visibility:</span>
                            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{visibility}</span>
                          </div>
                        </div>

                        {/* Final Action buttons */}
                        <div className="form-action-buttons-refined" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <button 
                            type="button" 
                            className="creator-action-btn btn-publish"
                            disabled={publishStatus !== 'idle'}
                            onClick={handleCreatePost}
                            style={{ width: '100%', height: '46px', fontSize: '15px' }}
                          >
                            {publishStatus === 'idle' && 'Publish Now'}
                            {publishStatus === 'loading' && <span className="spinner-loader"></span>}
                            {publishStatus === 'success' && <span className="success-checkmark">✓ Success</span>}
                          </button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-schedule"
                              onClick={() => { showToast(`Post scheduled for ${scheduleDate || 'today'} at ${scheduleTime || 'noon'} 📅`); setActiveTab('home'); setCurrentStep(1); }}
                              style={{ width: '100%' }}
                            >
                              Schedule Post
                            </button>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-draft"
                              onClick={() => { showToast('Draft saved successfully! 📁'); setActiveTab('home'); setCurrentStep(1); }}
                              style={{ width: '100%' }}
                            >
                              Save Draft
                            </button>
                          </div>
                        </div>

                        <div className="step-navigation-buttons" style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                          <button 
                            type="button" 
                            className="creator-action-btn btn-draft" 
                            onClick={() => goToStep(3)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back to Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Sticky Live Preview Panel (Always Visible in Steps 1,2,3,4!) */}
                  <aside className="creator-dashboard-column preview-panel-column">
                    <div className="sticky-preview-wrapper">
                      <div className="preview-header">
                        <h3 className="preview-header-title">Live Preview</h3>
                      </div>
                      
                      {/* Glassmorphism Phone Frame */}
                      <div className="mobile-phone-frame">
                        {/* Shimmer pulse effect overlay when data synchronizes */}
                        {previewPulse && (
                          <div className="preview-updating-shimmer-active">
                            <span className="shimmer-text-glow">Syncing Live...</span>
                          </div>
                        )}

                        {/* Device glare reflections */}
                        <div className="phone-glass-shine"></div>
                        <div className="phone-glass-border"></div>
                        
                        {/* Dynamic Island */}
                        <div className="phone-notch-island"></div>
                        
                        <div className="phone-screen-content">
                          {/* Status Bar */}
                          <div className="phone-status-bar">
                            <span className="status-time">{systemTime}</span>
                            <div className="status-icons">
                              {/* Signal Bars SVG */}
                              <svg width="15" height="10" viewBox="0 0 15 10" fill="currentColor" className="status-icon-svg">
                                <rect x="0" y="7" width="2" height="3" rx="0.5" />
                                <rect x="3" y="5" width="2" height="5" rx="0.5" />
                                <rect x="6" y="3" width="2" height="7" rx="0.5" />
                                <rect x="9" y="1" width="2" height="9" rx="0.5" />
                                <rect x="12" y="0" width="2" height="10" rx="0.5" opacity="0.3" />
                              </svg>
                              {/* WiFi SVG */}
                              <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor" className="status-icon-svg">
                                <path d="M8 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.55-3.55a1.5 1.5 0 0 1 0-2.12c1.95-1.95 5.15-1.95 7.1 0a1.5 1.5 0 0 1-2.12 2.12c-.78-.78-2.06-.78-2.84 0a1.5 1.5 0 0 1-2.14 0zm-2.83-2.83a1.5 1.5 0 0 1 0-2.12c3.5-3.5 9.19-3.5 12.7 0a1.5 1.5 0 1 1-2.12 2.12c-2.33-2.33-6.13-2.33-8.46 0a1.5 1.5 0 0 1-2.12 0z" />
                              </svg>
                              {/* Battery SVG */}
                              <svg width="20" height="10" viewBox="0 0 22 11" fill="currentColor" className="status-icon-svg">
                                <rect x="1" y="1" width="16" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
                                <rect x="3" y="3" width="12" height="5" rx="1" fill="#10b981" />
                                <path d="M18 4h1v3h-1z" />
                              </svg>
                            </div>
                          </div>

                          {/* Social Post Content Preview */}
                          <div className="phone-post-card">
                            {/* Post Header */}
                            <div className="phone-post-header">
                              <div className="user-profile-info">
                                <div className="user-avatar-placeholder">
                                  {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="user-avatar-preview-img" />
                                  ) : (
                                    <div className="default-avatar-glow">🌟</div>
                                  )}
                                </div>
                                <div className="user-text-meta">
                                  <span className="preview-username">@{user?.username || 'Suvarnatest'}</span>
                                  <span className="preview-location">{newPostLocation ? newPostLocation.split(',')[0] : 'Travel Heaven 📍'}</span>
                                </div>
                              </div>
                              <button type="button" className="post-header-more-btn">
                                <svg width="18" height="4" viewBox="0 0 24 6" fill="currentColor">
                                  <circle cx="3" cy="3" r="3" />
                                  <circle cx="12" cy="3" r="3" />
                                  <circle cx="21" cy="3" r="3" />
                                </svg>
                              </button>
                            </div>

                            {/* Divider line */}
                            <div className="phone-post-divider"></div>

                            {/* Post Carousel Images */}
                            <div 
                              className="phone-post-media-container"
                              onClick={handleImageClick}
                              onDoubleClick={handleDoubleTapPreview}
                            >
                              {/* Glowing Heart animation overlay */}
                              {showHeartOverlay && (
                                <div className="heart-overlay-container animate-pop">
                                  <svg className="heart-overlay-icon" viewBox="0 0 24 24" fill="#ff007f">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                  </svg>
                                </div>
                              )}
                              
                              {/* Custom Interactive Particle Burst Overlay */}
                              {likeParticles.map((p, index) => {
                                const angle = (index * 45 * Math.PI) / 180;
                                const distance = 45 + Math.random() * 15;
                                const tx = Math.cos(angle) * distance;
                                const ty = Math.sin(angle) * distance;
                                return (
                                  <span 
                                    key={p.id} 
                                    className="like-particle-dot"
                                    style={{
                                      left: `${p.x}px`,
                                      top: `${p.y}px`,
                                      '--tx': `${tx}px`,
                                      '--ty': `${ty}px`,
                                    } as React.CSSProperties}
                                  />
                                );
                              })}
                              
                              {postImages.length === 0 ? (
                                <div className="media-placeholder-visual">
                                  <span className="visual-icon">📸</span>
                                  <span className="visual-text">No media attached</span>
                                </div>
                              ) : (
                                <>
                                  <img 
                                    key={postImages[previewCarouselIndex < postImages.length ? previewCarouselIndex : 0]}
                                    src={postImages[previewCarouselIndex < postImages.length ? previewCarouselIndex : 0]} 
                                    alt="Live Post Preview" 
                                    className="phone-preview-media-img phone-preview-fade" 
                                  />
                                  
                                  {/* Dynamic Carousel dots indicators array length sync */}
                                  {postImages.length > 1 && (
                                    <div className="preview-carousel-indicators-dots">
                                      {postImages.map((_, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`indicator-dot-small ${(previewCarouselIndex < postImages.length ? previewCarouselIndex : 0) === idx ? 'active' : ''}`}
                                        ></span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Divider line */}
                            <div className="phone-post-divider"></div>

                            {/* Post Interaction Actions */}
                            <div className="phone-post-actions-row">
                              <div className="left-interactions-group">
                                <button 
                                  type="button" 
                                  className={`action-btn-preview heart-btn ${isPreviewLiked ? 'liked' : ''}`}
                                  onClick={() => setIsPreviewLiked(!isPreviewLiked)}
                                >
                                  <svg width="22" height="22" fill={isPreviewLiked ? "#ff007f" : "none"} stroke={isPreviewLiked ? "#ff007f" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                                
                                <button type="button" className="action-btn-preview">
                                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </button>
                                
                                <button type="button" className="action-btn-preview">
                                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                  </svg>
                                </button>
                              </div>
                              
                              <button 
                                type="button" 
                                className={`action-btn-preview save-btn ${isPreviewSaved ? 'saved' : ''}`}
                                onClick={() => setIsPreviewSaved(!isPreviewSaved)}
                              >
                                <svg width="22" height="22" fill={isPreviewSaved ? "#ec4899" : "none"} stroke={isPreviewSaved ? "#ec4899" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                              </button>
                            </div>

                            {/* Divider line */}
                            <div className="phone-post-divider"></div>

                            {/* Likes info */}
                            <div className="phone-likes-section">
                              <span className="likes-bold">{isPreviewLiked ? '1,249 likes' : '1,248 likes'}</span>
                              <span className="likes-subtext">
                                Liked by <strong>traveler_anna</strong> and <strong>{isPreviewLiked ? '1,248' : '1,247'} others</strong>
                              </span>
                            </div>

                            {/* Caption details */}
                            <div className="phone-caption-section">
                              <div className="caption-text-block">
                                <span className="caption-username">@{user?.username || 'Suvarnatest'}</span>{' '}
                                {postTitle && <span className="caption-title">{postTitle} 🏔️</span>}{' '}
                                <span className="caption-body">
                                  {isCaptionExpanded 
                                    ? (newPostCaption || "The perfect morning view after hiking through the Alps. One of my favorite places I've ever visited.")
                                    : (newPostCaption ? (newPostCaption.length > 85 ? newPostCaption.slice(0, 85) : newPostCaption) : "The perfect morning view after hiking through the Alps. One of my favorite places I've ever visited.")
                                  }
                                  {!isCaptionExpanded && (newPostCaption ? newPostCaption.length > 85 : true) && (
                                    <span 
                                      className="caption-more-trigger"
                                      onClick={() => setIsCaptionExpanded(true)}
                                    >
                                      ...more
                                    </span>
                                  )}
                                </span>
                              </div>
                              
                              <div className="preview-hashtags-inline">
                                {(newPostCaption.match(/#[a-zA-Z0-9_]+/g) || ['#travora', '#explore', '#wanderlust']).join(' ')}
                              </div>

                              {newPostLocation && (
                                <div className="preview-location-chip">
                                  <span className="chip-icon">📍</span>
                                  <span className="chip-text">{newPostLocation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {/* VIEW 7: LIVE DISCOVERY PAGE */}
            {activeTab === 'live' && (
              <div className="live-discovery-wrapper animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <header className="live-discovery-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="explore-popular-hero-title" style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Live Streams</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Watch your favorite travel creators stream active adventures live.</p>
                  </div>
                  <button 
                    className="explore-hero-cta-btn btn-shimmer-sweep" 
                    onClick={() => { setActiveTab('live-studio'); setLiveStep(1); }}
                    style={{ background: 'var(--brand-gradient)', color: 'white', padding: '10px 18px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M20.49 3.51a10 10 0 0 1 0 14.14M3.51 17.66a10 10 0 0 1 0-14.14" />
                    </svg>
                    Go Live Studio
                  </button>
                </header>

                {/* Filter/Category chips row */}
                <div className="explore-categories-scroll-wrapper" style={{ margin: 0 }}>
                  <div className="explore-categories-container">
                    {['All', 'IRL', 'Adventure', 'Culture', 'Q&A', 'Behind the Scenes', 'Special Events'].map((cat) => {
                      const isActive = liveCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          className={`explore-category-btn ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setHasEverSwitchedLiveCategory(true);
                            setIsLiveSwitchingCategory(true);
                            setLiveCategory(cat); // Update active category state instantly for responsive motion feedback
                            setTimeout(() => {
                              setLiveGridCategory(cat); // Update content filtering after grid fade-out
                              setIsLiveSwitchingCategory(false);
                            }, 220);
                          }}
                          animate={isActive ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ 
                            scale: {
                              duration: 0.32,
                              times: [0, 0.4, 1],
                              ease: "easeOut"
                            }
                          }}
                          style={{ 
                            padding: '8px 18px', 
                            borderRadius: '24px', 
                            border: isActive ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)', 
                            background: isActive ? 'transparent' : 'rgba(255, 255, 255, 0.02)', 
                            color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)', 
                            fontSize: '13px', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            position: 'relative',
                            overflow: 'visible',
                            zIndex: 1
                          }}
                        >
                          {isActive && (
                            <>
                              {/* Faint Bloom / Glow behind the button */}
                              <motion.div
                                layoutId="liveCategoryActiveGlow"
                                className="absolute inset-0"
                                transition={{
                                  type: 'spring',
                                  stiffness: 350,
                                  damping: 28,
                                  mass: 0.9
                                }}
                                style={{
                                  borderRadius: '24px',
                                  background: 'var(--brand-gradient)',
                                  filter: 'blur(12px)',
                                  opacity: 0.35,
                                  zIndex: -2,
                                  pointerEvents: 'none',
                                  transform: 'translate3d(0, 2px, 0)'
                                }}
                              />
                              {/* Main Glassy Active Bubble */}
                              <motion.div
                                layoutId="liveCategoryActiveBubble"
                                className="absolute inset-0"
                                transition={{
                                  type: 'spring',
                                  stiffness: 350,
                                  damping: 28,
                                  mass: 0.9
                                }}
                                style={{
                                  borderRadius: '24px',
                                  background: 'var(--brand-gradient)',
                                  boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.45), inset 0 -1.2px 1.5px rgba(0, 0, 0, 0.25), 0 6px 18px rgba(236, 72, 153, 0.3), 0 2px 6px rgba(139, 92, 246, 0.2)',
                                  zIndex: -1,
                                  overflow: 'hidden'
                                }}
                              >
                                {/* Diagonal glass reflection shine */}
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(115deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%)',
                                    borderRadius: '24px',
                                    pointerEvents: 'none'
                                  }}
                                />
                              </motion.div>
                            </>
                          )}
                          <span style={{ position: 'relative', zIndex: 2 }}>{cat}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Control Row: Search bar and Followed Only filter grouped side-by-side on the left */}
                <div className="live-filters-control-row" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  {/* Search Bar */}
                  <div className="search-input-wrapper explore-search-input-wrapper" style={{ margin: 0, flex: 1, maxWidth: '400px', height: '42px', padding: '0 14px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                    <svg 
                      width="15" 
                      height="15" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="explore-search-svg-icon"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                      type="text" 
                      className="comment-input explore-search-field"
                      placeholder="Search streams or creators..."
                      value={liveSearchQuery}
                      onChange={(e) => setLiveSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', marginLeft: '10px', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Right Side: Followed Toggle Button */}
                  <button
                    type="button"
                    className={`explore-category-btn ${showFollowedOnly ? 'active' : ''}`}
                    onClick={() => setShowFollowedOnly(!showFollowedOnly)}
                    style={{ 
                      padding: '10px 18px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--card-border)', 
                      background: showFollowedOnly ? 'var(--brand-gradient)' : 'var(--card-bg)', 
                      color: 'white', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      height: '42px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={showFollowedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    Followed Only
                  </button>
                </div>

                {/* Stream Cards Grid */}
                {activeStreams.filter(s => {
                  const matchesCategory = liveGridCategory === 'All' || s.category === liveGridCategory;
                  const matchesSearch = s.title.toLowerCase().includes(liveSearchQuery.toLowerCase()) || s.username.toLowerCase().includes(liveSearchQuery.toLowerCase());
                  const matchesFollowed = !showFollowedOnly || s.isFollowed;
                  return matchesCategory && matchesSearch && matchesFollowed;
                }).length > 0 ? (
                  <div 
                    className={`instagram-explore-grid ${isLiveSwitchingCategory ? 'glass-switching' : ''} ${!hasEverSwitchedLiveCategory ? 'no-animate' : ''}`} 
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px 20px' }}
                  >
                    {activeStreams
                      .filter(s => {
                        const matchesCategory = liveGridCategory === 'All' || s.category === liveGridCategory;
                        const matchesSearch = s.title.toLowerCase().includes(liveSearchQuery.toLowerCase()) || s.username.toLowerCase().includes(liveSearchQuery.toLowerCase());
                        const matchesFollowed = !showFollowedOnly || s.isFollowed;
                        return matchesCategory && matchesSearch && matchesFollowed;
                      })
                      .map((stream, idx) => (
                        <div 
                          key={stream.id}
                          className="instagram-explore-item-card"
                          style={{
                            overflow: 'hidden',
                            background: 'none',
                            border: 'none',
                            aspectRatio: 'auto',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={() => {
                            setActiveStreams(prev => prev.map(s => s.id === stream.id ? { ...s, isHovered: true } : s));
                          }}
                          onMouseLeave={() => {
                            setActiveStreams(prev => prev.map(s => s.id === stream.id ? { ...s, isHovered: false } : s));
                          }}
                          onClick={() => {
                            showToast(`Connecting to ${stream.username}'s stream...`);
                          }}
                        >
                          {/* Thumbnail / Widescreen Preview Area */}
                          <div style={{ 
                            position: 'relative', 
                            width: '100%', 
                            aspectRatio: '16 / 9', 
                            overflow: 'hidden',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: stream.isHovered ? '0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(236,72,153,0.15)' : '0 4px 10px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                          }}>
                            <img 
                              src={stream.thumbnail} 
                              alt={stream.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: stream.isHovered ? 'scale(1.03)' : 'scale(1)' }} 
                            />
                            
                            {/* YouTube style LIVE Badge bottom right */}
                            <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', zIndex: 5 }}>
                              <span className="live-status-dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                              LIVE
                            </div>

                            {/* Mute/unmute overlay top right on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveStreams(prev => prev.map(s => s.id === stream.id ? { ...s, isMuted: !s.isMuted } : s));
                                showToast(stream.isMuted ? 'Audio Unmuted' : 'Audio Muted');
                              }}
                              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', opacity: stream.isHovered ? 1 : 0, transition: 'opacity 0.2s ease', zIndex: 10 }}
                              title={stream.isMuted ? 'Unmute preview' : 'Mute preview'}
                            >
                              {stream.isMuted ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                  <line x1="23" y1="9" x2="17" y2="15"></line>
                                  <line x1="17" y1="9" x2="23" y2="15"></line>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                </svg>
                              )}
                            </button>

                            {/* Simulated moving stream line on hover */}
                            {stream.isHovered && (
                              <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--brand-gradient)', width: '100%' }} />
                            )}
                          </div>

                          {/* Footer details - YouTube Live style layout */}
                          <div style={{ padding: '12px 0px 8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            {/* Avatar on the left */}
                            <div className="story-ring" style={{ width: '36px', height: '36px', padding: '2px', background: 'var(--brand-gradient)', flexShrink: 0, borderRadius: '50%' }}>
                              <img src={stream.avatar} alt={stream.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #07090e' }} />
                            </div>
                            
                            {/* Metadata on the right */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Title (2 lines max, bold, ellipsis) */}
                              <h4 style={{ 
                                fontSize: '14px', 
                                fontWeight: 700, 
                                color: 'var(--text-primary)', 
                                margin: 0,
                                lineHeight: '1.4',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {stream.title}
                              </h4>
                              
                              {/* Username + Verified Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stream.username}</span>
                                {stream.isVerified && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" style={{ color: 'white', flexShrink: 0 }}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                )}
                              </div>
                              
                              {/* Watching Count */}
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {formatCount(stream.viewers)} watching
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  /* Empty state illustrated */
                  <div className="explore-empty-state-glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', borderRadius: '16px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', textAlign: 'center', minHeight: '350px' }}>
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-slow">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                        <circle cx="12" cy="12" r="3" fill="#ec4899" opacity="0.3" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No Live Streams Active</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '380px', lineHeight: 1.5 }}>
                      There are currently no active creators streaming in the "{liveGridCategory}" category. Try switching filters or start your own stream!
                    </p>
                    <button 
                      onClick={() => { setActiveTab('live-studio'); setLiveStep(1); }}
                      style={{ marginTop: '20px', background: 'var(--brand-gradient)', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      Start Your Broadcast
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 8: GO LIVE STUDIO */}
            {activeTab === 'live-studio' && (
              <div className="creator-dashboard-wrapper animate-fade-in" style={{ padding: '24px' }}>
                <header className="creator-dashboard-header">
                  <div className="header-left">
                    <button onClick={() => { setActiveTab('live'); }} className="creator-change-choice-btn" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', padding: 0 }}>
                      &larr; Back to Streams
                    </button>
                    <h2 className="creator-dashboard-title">Go Live Studio</h2>
                    <p className="creator-dashboard-subtitle">Configure your details, customize stream sources, and start broadcasting.</p>
                  </div>
                  <div className="header-right">
                    <div className="breadcrumb-nav">
                      <span className="breadcrumb-item">Live Studio</span>
                      <span className="breadcrumb-arrow">/</span>
                      <span className="breadcrumb-item active">Step {liveStep}</span>
                    </div>
                  </div>
                </header>

                {/* Wizard Stepper Progress Bar */}
                <div className="creator-stepper-container" style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
                  {[
                    { number: 1, label: 'Details' },
                    { number: 2, label: 'Customization' },
                    { number: 3, label: 'Visibility & Settings' }
                  ].map((step, idx) => {
                    const isCompleted = liveStep > step.number;
                    const isActive = liveStep === step.number;
                    return (
                      <React.Fragment key={step.number}>
                        <div 
                          className={`stepper-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                          onClick={() => {
                            if (isCompleted || step.number < liveStep) {
                              setLiveStep(step.number);
                            }
                          }}
                        >
                          <div className="stepper-circle">
                            {isCompleted ? '✓' : step.number}
                          </div>
                          <span className="stepper-label">{step.label}</span>
                        </div>
                        {idx < 2 && (
                          <div className={`stepper-line ${liveStep > step.number ? 'completed' : ''}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="creator-dashboard-layout" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div className="creator-step-main-column" style={{ flex: 1, width: '100%' }}>
                    
                    {/* STEP 1: DETAILS */}
                    {liveStep === 1 && (
                      <div className="creator-glass-card editor-form-card">
                        <div className="panel-header">
                          <h3 className="panel-title">Stream Details</h3>
                          <p className="panel-desc">Set the public name, description, and categories for your stream.</p>
                        </div>

                        <div className="editor-form">
                          {/* Title (Required) */}
                          <div className="form-group">
                            <label className="form-label" htmlFor="live-title-input">Stream Title *</label>
                            <input 
                              type="text" 
                              id="live-title-input" 
                              className="form-input-premium" 
                              placeholder="e.g., Live Sunset Hike in Chamonix!"
                              value={liveTitle}
                              onChange={(e) => setLiveTitle(e.target.value)}
                              required
                            />
                          </div>

                          {/* Description */}
                          <div className="form-group">
                            <label className="form-label" htmlFor="live-desc-input">Stream Description</label>
                            <textarea 
                              id="live-desc-input" 
                              className="form-input-premium form-textarea-premium" 
                              placeholder="Tell viewers what your live stream is about..."
                              value={liveDescription}
                              onChange={(e) => setLiveDescription(e.target.value)}
                              rows={4}
                            />
                          </div>

                          {/* Category Tag Selection */}
                          <div className="form-group">
                            <label className="form-label">Stream Category tags</label>
                            <div className="categories-selection">
                              {['IRL', 'Adventure', 'Culture', 'Q&A', 'Behind the Scenes'].map((cat) => {
                                const isSelected = liveSelectedCategories.includes(cat);
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    className={`category-pill ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                      setLiveSelectedCategories(prev => {
                                        if (prev.includes(cat)) {
                                          return prev.filter(c => c !== cat);
                                        } else {
                                          return [...prev, cat];
                                        }
                                      });
                                    }}
                                  >
                                    {isSelected && <span style={{ marginRight: '4px' }}>✓</span>}
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Navigation row */}
                          <div className="step-navigation-buttons" style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-publish"
                              disabled={!liveTitle.trim()}
                              onClick={() => setLiveStep(2)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              Next: Customization
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: CUSTOMIZATION */}
                    {liveStep === 2 && (
                      <div className="creator-glass-card editor-form-card">
                        <div className="panel-header">
                          <h3 className="panel-title">Customization & Source</h3>
                          <p className="panel-desc">Upload a poster thumbnail and choose your streaming source setup.</p>
                        </div>

                        <div className="editor-form">
                          {/* Thumbnail Upload Drag & Drop */}
                          <div className="form-section">
                            <label className="section-label">Stream Thumbnail Cover</label>
                            <div 
                              className="upload-dropzone"
                              style={{ border: '2px dashed var(--card-border)', background: 'var(--input-bg)', padding: '24px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' }}
                              onClick={() => {
                                setLiveThumbnail('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80');
                                showToast('Thumbnail uploaded successfully!');
                              }}
                            >
                              {liveThumbnail ? (
                                <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                                  <img src={liveThumbnail} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 600 }}>
                                    Click to replace thumbnail cover
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload stream cover</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag & drop high-res JPEG/PNG (16:9 recommended)</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stream Source Choose cards */}
                          <div className="form-group" style={{ marginTop: '24px' }}>
                            <label className="form-label">Stream Connection Source</label>
                            <div className="creator-choice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              {/* Built-in webcam card */}
                              <div 
                                className={`creation-choice-card discover-premium-card ${liveSource === 'webcam' ? 'active' : ''}`}
                                onClick={() => setLiveSource('webcam')}
                                style={{ padding: '20px', borderRadius: '12px', border: liveSource === 'webcam' ? '1.5px solid var(--primary)' : '1px solid var(--card-border)', background: 'var(--card-bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: liveSource === 'webcam' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Built-in Camera</span>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick and easy stream directly using your laptop or device webcam.</p>
                              </div>

                              {/* Streaming software (encoder) card */}
                              <div 
                                className={`creation-choice-card discover-premium-card ${liveSource === 'encoder' ? 'active' : ''}`}
                                onClick={() => setLiveSource('encoder')}
                                style={{ padding: '20px', borderRadius: '12px', border: liveSource === 'encoder' ? '1.5px solid var(--primary)' : '1px solid var(--card-border)', background: 'var(--card-bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: liveSource === 'encoder' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Streaming Software</span>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Use encoder software like OBS Studio or Streamlabs for custom overlays.</p>
                              </div>
                            </div>
                          </div>

                          {/* Encoder Fields Section if streaming software chosen */}
                          {liveSource === 'encoder' && (
                            <div className="creator-inner-glass-card animate-fade-in" style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Encoder Configuration Settings</h4>
                              
                              {/* Stream URL */}
                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '11px' }}>Stream Server URL</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input type="text" className="form-input-premium" style={{ flex: 1, fontSize: '12px' }} readOnly value={streamUrl} />
                                  <button 
                                    type="button" 
                                    onClick={() => { navigator.clipboard.writeText(streamUrl); showToast('Server URL copied!'); }}
                                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'white', width: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Copy Server URL"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                  </button>
                                </div>
                              </div>

                              {/* Stream Key */}
                              <div className="form-group" style={{ marginTop: '14px' }}>
                                <label className="form-label" style={{ fontSize: '11px' }}>Stream Connection Key</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input 
                                    type={isKeyRevealed ? 'text' : 'password'} 
                                    className="form-input-premium" 
                                    style={{ flex: 1, fontSize: '12px', letterSpacing: isKeyRevealed ? '0px' : '4px' }} 
                                    readOnly 
                                    value={streamKey} 
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => setIsKeyRevealed(!isKeyRevealed)}
                                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'white', width: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title={isKeyRevealed ? 'Hide Stream Key' : 'Reveal Stream Key'}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => { navigator.clipboard.writeText(streamKey); showToast('Stream Key copied!'); }}
                                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'white', width: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Copy Stream Key"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                  </button>
                                </div>
                              </div>

                              <button 
                                type="button"
                                onClick={() => {
                                  const generated = 'live_usr_' + Math.random().toString(36).substring(2, 15);
                                  setStreamKey(generated);
                                  showToast('Stream key regenerated!');
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', marginTop: '10px', padding: 0 }}
                              >
                                &orarr; Regenerate Stream Key
                              </button>
                            </div>
                          )}

                          {/* Navigation row */}
                          <div className="step-navigation-buttons" style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-draft"
                              onClick={() => setLiveStep(1)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                              Back
                            </button>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-publish"
                              onClick={() => setLiveStep(3)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              Next: Settings
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: VISIBILITY & SETTINGS */}
                    {liveStep === 3 && (
                      <div className="creator-glass-card editor-form-card">
                        <div className="panel-header">
                          <h3 className="panel-title">Visibility & Permissions</h3>
                          <p className="panel-desc">Manage stream privacy settings, age restrictions, and chat controls.</p>
                        </div>

                        <div className="editor-form">
                          {/* Live Visibility Cards */}
                          <div className="form-group">
                            <label className="form-label">Stream Visibility</label>
                            <div className="visibility-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              {[
                                { key: 'public', title: 'Public', desc: 'Anyone on Travora can watch' },
                                { key: 'followers', title: 'Followers Only', desc: 'Only followers can watch' },
                                { key: 'private', title: 'Private', desc: 'Test stream only visible to you' }
                              ].map(option => (
                                <label key={option.key} className={`visibility-radio-card ${liveVisibility === option.key ? 'active' : ''}`} style={{ cursor: 'pointer', padding: '16px', borderRadius: '12px', border: liveVisibility === option.key ? '1.5px solid var(--primary)' : '1px solid var(--card-border)', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <input
                                    type="radio"
                                    name="live-visibility-selection"
                                    value={option.key}
                                    checked={liveVisibility === option.key}
                                    onChange={() => setLiveVisibility(option.key as any)}
                                    className="sr-only"
                                  />
                                  <span className="radio-title" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{option.title}</span>
                                  <span className="radio-description" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{option.desc}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Toggle switches */}
                          <div className="toggles-list-section" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Allow Comments */}
                            <div className="toggle-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                <div className="toggle-info">
                                  <span className="toggle-label-title" style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Allow Chat Comments</span>
                                  <span className="toggle-label-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Let viewers write live messages in chat stream</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input type="checkbox" checked={allowLiveComments} onChange={(e) => setAllowLiveComments(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Chat Moderation */}
                            <div className="toggle-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                <div className="toggle-info">
                                  <span className="toggle-label-title" style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Chat Moderation Filter</span>
                                  <span className="toggle-label-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-block spam comments, bots, and offensive language</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input type="checkbox" checked={liveChatModeration} onChange={(e) => setLiveChatModeration(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Notify Followers */}
                            <div className="toggle-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                <div className="toggle-info">
                                  <span className="toggle-label-title" style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Notify Followers</span>
                                  <span className="toggle-label-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Send push alert notifications when you start broadcasting</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input type="checkbox" checked={notifyFollowers} onChange={(e) => setNotifyFollowers(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* Save Recording */}
                            <div className="toggle-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                <div className="toggle-info">
                                  <span className="toggle-label-title" style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Save Recording to Profile</span>
                                  <span className="toggle-label-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Convert live stream into a Profile Postcard record when finished</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input type="checkbox" checked={saveRecording} onChange={(e) => setSaveRecording(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            {/* COPPA compliance style age-appropriate toggle */}
                            <div className="toggle-switch-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '16px', marginTop: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                <div className="toggle-info">
                                  <span className="toggle-label-title" style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Restrict to 18+ Audience Only</span>
                                  <span className="toggle-label-desc" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mark stream as mature content for adult audiences (COPPA compliance)</span>
                                </div>
                              </div>
                              <label className="switch">
                                <input type="checkbox" checked={liveCoppaToggle} onChange={(e) => setLiveCoppaToggle(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>
                          </div>

                          {/* Final Action buttons row */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-publish"
                              onClick={() => {
                                showToast('Live stream launching...');
                                setActiveTab('live-dashboard');
                                setStreamStatus('connecting');
                                setDashboardViewers(0);
                                setDashboardLikes(0);
                                setDashboardChatRate(0);
                              }}
                              style={{ width: '100%', height: '46px', fontSize: '15px', background: 'var(--brand-gradient)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }}
                            >
                              Go Live Now
                            </button>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <button 
                                type="button" 
                                className="creator-action-btn btn-schedule"
                                onClick={() => {
                                  showToast('Live stream scheduled!');
                                  setActiveTab('live');
                                }}
                                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'white', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Schedule Stream
                              </button>
                              <button 
                                type="button" 
                                className="creator-action-btn btn-draft"
                                onClick={() => {
                                  showToast('Live stream draft saved!');
                                  setActiveTab('live');
                                }}
                                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'white', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Save Draft
                              </button>
                            </div>
                          </div>

                          <div className="step-navigation-buttons" style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                            <button 
                              type="button" 
                              className="creator-action-btn btn-draft" 
                              onClick={() => setLiveStep(2)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6"></polyline>
                              </svg>
                              Back
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 9: LIVE STREAM DASHBOARD */}
            {activeTab === 'live-dashboard' && (
              <div className="live-dashboard-wrapper animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: streamStatus === 'live' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: streamStatus === 'live' ? '1px solid #ef4444' : '1px solid var(--card-border)', padding: '4px 10px', borderRadius: '20px' }}>
                      <span className={streamStatus === 'live' ? 'live-status-dot-pulse' : ''} style={{ width: '8px', height: '8px', borderRadius: '50%', background: streamStatus === 'live' ? '#ef4444' : '#64748b', display: 'inline-block' }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: streamStatus === 'live' ? '#ef4444' : '#cbd5e1' }}>
                        {streamStatus === 'connecting' ? 'Connecting...' : streamStatus === 'live' ? 'Live' : 'No Data'}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{liveTitle || 'Untitled Live Stream'}</h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stream Dashboard &bull; {liveSelectedCategories.join(', ') || 'No Category'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to end this live stream?')) {
                        setStreamStatus('connecting');
                        setActiveTab('live');
                        showToast('Live stream ended successfully!');
                      }
                    }}
                    style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                  >
                    End Stream
                  </button>
                </header>

                {/* Dismissible Tip Banner */}
                {liveShowTipBanner && (
                  <div className="tip-banner-card discover-premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line></svg>
                      <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>
                        Managing chat moderators or pinning comments can help support your channel community during streaming.
                      </span>
                    </div>
                    <button 
                      onClick={() => setLiveShowTipBanner(false)}
                      style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '18px', cursor: 'pointer', opacity: 0.7 }}
                    >
                      &times;
                    </button>
                  </div>
                )}

                {/* Main Dashboard Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '20px', minHeight: '520px' }}>
                  
                  {/* Left Column: Stream preview, stats, and settings/analytics tabs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Preview Screen */}
                    <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '16px', background: '#0a0d14', border: '1px solid var(--card-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {streamStatus === 'connecting' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div className="accent-loader-circle" style={{ width: '36px', height: '36px', border: '3.5px solid rgba(255,255,255,0.05)', borderTop: '3.5px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></div>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Establishing connection, waiting for stream data...</span>
                        </div>
                      ) : (
                        /* Simulated stream preview or webcam stream image placeholder */
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          {liveSource === 'webcam' ? (
                            /* Simulated webcam view with gradient moving patterns */
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.15, color: 'white' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                              <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Webcam active</span>
                              </div>
                            </div>
                          ) : (
                            /* Encoder feed simulation */
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(-45deg, #090d16 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.15, color: 'white' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                              <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Encoder streaming active</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats Summary strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div className="discover-premium-card" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Concurrent Viewers</span>
                        <span style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', display: 'block', color: 'var(--text-primary)' }}>
                          {formatCount(dashboardViewers)}
                        </span>
                      </div>
                      <div className="discover-premium-card" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Likes Count</span>
                        <span style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', display: 'block', color: '#ec4899' }}>
                          {formatCount(dashboardLikes)}
                        </span>
                      </div>
                      <div className="discover-premium-card" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chat Rate</span>
                        <span style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', display: 'block', color: '#3b82f6' }}>
                          {dashboardChatRate} msgs/min
                        </span>
                      </div>
                    </div>

                    {/* Tab Navigation Menu */}
                    <div className="profile-tabs-nav" style={{ margin: 0 }}>
                      {['settings', 'analytics', 'health'].map((tab) => (
                        <button 
                          key={tab}
                          className={`profile-tab-btn ${dashboardTab === tab ? 'active' : ''}`}
                          onClick={() => setDashboardTab(tab as any)}
                        >
                          <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{tab}</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab Content Panels */}
                    <div className="discover-premium-card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', minHeight: '180px' }}>
                      
                      {/* Settings Tab */}
                      {dashboardTab === 'settings' && (
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Stream Adjustments</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Allow Chat Comments</span>
                              <label className="switch">
                                <input type="checkbox" checked={allowLiveComments} onChange={(e) => setAllowLiveComments(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Chat moderation filters</span>
                              <label className="switch">
                                <input type="checkbox" checked={liveChatModeration} onChange={(e) => setLiveChatModeration(e.target.checked)} />
                                <span className="slider round"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analytics Tab (Gradient area chart plotted cleanly using SVG) */}
                      {dashboardTab === 'analytics' && (
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Viewer Engagement Rate (Real-time)</h4>
                          <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                            <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%' }}>
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                              <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                              <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                              
                              <path 
                                d="M 0,110 L 40,80 L 80,95 L 120,60 L 160,40 L 200,45 L 240,30 L 280,50 L 320,25 L 360,15 L 400,10 L 400,120 L 0,120 Z" 
                                fill="url(#chartGradient)" 
                              />
                              <path 
                                d="M 0,110 L 40,80 L 80,95 L 120,60 L 160,40 L 200,45 L 240,30 L 280,50 L 320,25 L 360,15 L 400,10" 
                                fill="none" 
                                stroke="#ec4899" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Stream Health Tab */}
                      {dashboardTab === 'health' && (
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Network Connection Diagnostics</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Connection Bitrate</span>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>4500 kbps (Excellent)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Frame Rate Stability</span>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>60 fps (Stable)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Stream Latency Delay</span>
                              <span style={{ color: '#f59e0b', fontWeight: 600 }}>1.2 seconds (Low Latency)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Frame Dropped Rate</span>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>0% (Healthy)</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right Column: Live Chat stream and inputs */}
                  <div className="discover-premium-card" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    
                    {/* Chat Header details */}
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Live Chat</span>
                      
                      {/* Moderation Dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button 
                          onClick={() => setLiveModerationMenuOpen(!liveModerationMenuOpen)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Moderation Settings"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                        {liveModerationMenuOpen && (
                          <div className="instagram-more-menu-dropdown animate-slide-up" style={{ right: 0, top: '24px', width: '200px', zIndex: 30 }}>
                            <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid var(--card-border)' }}>Moderation</div>
                            <button className="instagram-more-menu-item" type="button" onClick={() => { showToast('Moderator filters toggled'); setLiveModerationMenuOpen(false); }}>
                              🛡️ Community Rules
                            </button>
                            <button className="instagram-more-menu-item" type="button" onClick={() => { showToast('Viewing participant list'); setLiveModerationMenuOpen(false); }}>
                              👥 Participants
                            </button>
                            <button className="instagram-more-menu-item" type="button" onClick={() => { showToast('Reactions toggled'); setLiveModerationMenuOpen(false); }}>
                              ❤️ Toggle Reactions
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Messages Container list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px' }}>
                      {liveChatMessages.map((msg) => (
                        <div key={msg.id} style={{ fontSize: '12px', lineHeight: '1.4' }}>
                          <span style={{ fontWeight: 700, color: msg.username === 'Suvarnatest' ? 'var(--primary)' : 'var(--text-secondary)' }}>@{msg.username}</span>{' '}
                          <span style={{ color: 'var(--text-primary)' }}>{msg.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chat input form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!liveChatInput.trim()) return;
                        const newMsg = {
                          id: Date.now().toString(),
                          username: 'Suvarnatest',
                          text: liveChatInput,
                          timestamp: '20:47'
                        };
                        setLiveChatMessages(prev => [...prev, newMsg]);
                        setLiveChatInput('');
                        setDashboardChatRate(prev => prev + 1);
                      }}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', gap: '8px' }}
                    >
                      <input 
                        type="text" 
                        placeholder="Say something in chat..." 
                        value={liveChatInput} 
                        onChange={(e) => setLiveChatInput(e.target.value)} 
                        className="comment-input"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                      />
                      <button 
                        type="submit" 
                        disabled={!liveChatInput.trim()}
                        style={{ background: 'var(--brand-gradient)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                      >
                        Send
                      </button>
                    </form>

                  </div>
                </div>
              </div>
            )}

            {/* VIEW 6: REDESIGNED PREMIUM TRAVEL PROFILE PAGE */}
            {activeTab === 'profile' && (
              <div className="profile-page-wrapper">
                
                {/* 1. Curved Header Profile Container Wrapper */}
                <div className="profile-header-card-wrapper">
                  
                  {/* Premium Landscape Cover Banner Image */}
                  <div 
                    className="profile-header-banner" 
                    style={{ 
                      backgroundImage: profileOwnerUser 
                        ? "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80')" 
                        : "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80')" 
                    }} 
                  />

                  <div className="profile-header-container">
                    
                    {/* Left: Avatar with ambient glow and segmented progress ring */}
                    <div className="profile-avatar-column">
                      
                      {/* Ambient background glow bleeding from avatar */}
                      <div className="avatar-ambient-glow" />

                      <div className="profile-avatar-gradient-ring">
                        
                        {/* Segmented SVG progress ring reflecting badge completion */}
                        <svg className="avatar-progress-ring-svg" width="102" height="102" viewBox="0 0 102 102">
                          <defs>
                            <linearGradient id="avatarRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="50%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                          <circle 
                            className="avatar-progress-ring-bg" 
                            cx="51" 
                            cy="51" 
                            r="47" 
                            stroke="rgba(255, 255, 255, 0.08)" 
                            strokeWidth="3.5" 
                            fill="none" 
                          />
                          <circle 
                            className="avatar-progress-ring-fill" 
                            cx="51" 
                            cy="51" 
                            r="47" 
                            stroke="url(#avatarRingGradient)" 
                            strokeWidth="3.5" 
                            fill="none" 
                            strokeDasharray={2 * Math.PI * 47} 
                            strokeDashoffset={2 * Math.PI * 47 * (1 - (profileOwnerUser ? parseInt(profileOwnerUser.badgesCount) : milestones.filter(m => m.unlocked).length) / milestones.length)}
                            strokeLinecap="round" 
                          />
                        </svg>

                        <div className="profile-avatar-circle-large animate-glow-pulse">
                          {profileOwnerUser ? (
                            profileOwnerUser.avatarUrl ? (
                              <img src={profileOwnerUser.avatarUrl} alt={profileOwnerUser.fullName} className="profile-avatar-img" />
                            ) : (
                              <div className="profile-avatar-initials-fallback animate-hue-shift">
                                {profileOwnerUser.fullName.charAt(0).toUpperCase()}
                              </div>
                            )
                          ) : (
                            user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.fullName} className="profile-avatar-img" />
                            ) : (
                              <div className="profile-avatar-initials-fallback animate-hue-shift">
                                {user.fullName.charAt(0).toUpperCase()}
                              </div>
                            )
                          )}
                        </div>

                        {/* Verified-traveler checkmark badge on edge */}
                        <div className="verified-badge-avatar animate-zoom-in" title="Verified Traveler">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>

                      </div>
                    </div>

                    {/* Right: Username, Action Buttons, Stats, and Biography */}
                    <div className="profile-info-column">
                      
                      {/* User Action Row */}
                      <div className="profile-action-row">
                        <div className="profile-username-level-row">
                          <h2 className="profile-username-header">@{profileOwnerUser ? profileOwnerUser.username.replace('@', '') : (editUsername || user.username)}</h2>
                          <div className="profile-rank-badge-header">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b">
                              <path d="M12 2L3 5v6c0 5.5 4.5 10 9 12 4.5-2 9-6.5 9-12V5l-9-3z" />
                            </svg>
                            <span>Lvl 4</span>
                          </div>
                        </div>

                        <div className="profile-action-buttons-group">
                          {!profileOwnerUser ? (
                            /* OWNER VIEW ACTION BUTTONS */
                            <>
                              <motion.button 
                                whileHover={{ scale: 1.03, boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}
                                whileTap={{ scale: 0.97 }}
                                className="profile-primary-action-btn shimmer-sweep"
                                onClick={() => setProfileTab('settings')}
                              >
                                Edit Profile
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.95 }}
                                className="profile-icon-action-btn"
                                onClick={() => setProfileTab('settings')}
                                title="Settings"
                              >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.05, background: 'rgba(239,68,68,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                className="profile-icon-action-btn logout-btn-red"
                                onClick={logout}
                                title="Log Out"
                              >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                  <polyline points="16 17 21 12 16 7" />
                                  <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                              </motion.button>
                            </>
                          ) : (
                            /* GUEST VIEW ADAPTIVE ACTION BUTTONS */
                            <>
                              <motion.button 
                                whileHover={{ scale: 1.03, boxShadow: followedUsers.has(profileOwnerUser.username) ? 'none' : '0 4px 15px rgba(236,72,153,0.3)' }}
                                whileTap={{ scale: 0.97 }}
                                className={`profile-primary-action-btn shimmer-sweep ${followedUsers.has(profileOwnerUser.username) ? 'btn-ghost-nomad' : ''}`}
                                onClick={() => {
                                  const username = profileOwnerUser.username;
                                  setFollowedUsers(prev => {
                                    const next = new Set(prev);
                                    if (next.has(username)) {
                                      next.delete(username);
                                      showToast(`Unfollowed @${username.replace('@','')}`);
                                    } else {
                                      next.add(username);
                                      showToast(`Following @${username.replace('@','')}`);
                                    }
                                    return next;
                                  });
                                }}
                              >
                                {followedUsers.has(profileOwnerUser.username) ? 'Following' : 'Follow'}
                              </motion.button>
                              
                              <motion.button 
                                whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.06)' }}
                                whileTap={{ scale: 0.97 }}
                                className="profile-primary-action-btn btn-ghost-nomad"
                                onClick={() => showToast(`Opening chat with @${profileOwnerUser.username.replace('@','')}`)}
                              >
                                Message
                              </motion.button>

                              <motion.button 
                                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.95 }}
                                className="profile-icon-action-btn"
                                onClick={() => showToast('Profile link copied to clipboard! 📋')}
                                title="Share Profile"
                              >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <circle cx="18" cy="5" r="3" />
                                  <circle cx="6" cy="12" r="3" />
                                  <circle cx="18" cy="19" r="3" />
                                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                </svg>
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Upgraded Stats Summary Row (Uniform layout, uniform custom iconography) */}
                      <div className="profile-stats-row-new">
                        
                        {/* Posts */}
                        <div className="profile-stat-item-new clickable">
                          <svg className="stat-icon-svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                            <circle cx="12" cy="12" r="4" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                          <span className="profile-stat-number">{animatedPosts}</span>
                          <span className="profile-stat-label">posts</span>
                        </div>

                        {/* Followers */}
                        <div className="profile-stat-item-new clickable">
                          <svg className="stat-icon-svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <span className="profile-stat-number">
                            {animatedFollowers >= 1000 ? `${(animatedFollowers / 1000).toFixed(1)}K` : animatedFollowers}
                          </span>
                          <span className="profile-stat-label">followers</span>
                        </div>

                        {/* Following */}
                        <div className="profile-stat-item-new clickable">
                          <svg className="stat-icon-svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                          </svg>
                          <span className="profile-stat-number">{animatedFollowing}</span>
                          <span className="profile-stat-label">following</span>
                        </div>

                        {/* Visited Countries (Tappable: opens Visited Countries popover) */}
                        <div 
                          className="profile-stat-item-new clickable countries-trigger" 
                          onClick={() => setShowCountriesPopover(!showCountriesPopover)}
                          title="Click to view visited countries"
                        >
                          <svg className="stat-icon-svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                            <path d="M2 12h20" />
                          </svg>
                          <span className="profile-stat-number">{animatedCountries}</span>
                          <span className="profile-stat-label" style={{ borderBottom: '1px dashed rgba(255,255,255,0.3)' }}>countries</span>

                          {/* Visited countries popover list */}
                          {showCountriesPopover && (
                            <div className="countries-popover-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                              <div className="popover-countries-header">
                                <span>Visited Countries</span>
                                <button type="button" className="close-countries-popover-btn" onClick={() => setShowCountriesPopover(false)}>&times;</button>
                              </div>
                              <div className="countries-popover-list">
                                {[
                                  { code: 'AT', name: 'Austria', flag: '🇦🇹', date: 'March 2025' },
                                  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', date: 'June 2025' },
                                  { code: 'DE', name: 'Germany', flag: '🇩🇪', date: 'July 2025' },
                                  { code: 'FR', name: 'France', flag: '🇫🇷', date: 'September 2025' },
                                  { code: 'IT', name: 'Italy', flag: '🇮🇹', date: 'December 2025' },
                                  { code: 'JP', name: 'Japan', flag: '🇯🇵', date: 'April 2026' }
                                ].map(c => (
                                  <div key={c.code} className="country-popover-item">
                                    <span>{c.flag} {c.name}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Badges (Tappable: switches to Milestones tab) */}
                        <div 
                          className="profile-stat-item-new clickable badges-trigger" 
                          onClick={() => { setProfileTab('milestones'); }}
                          title="Click to view Milestones Achievements"
                        >
                          <svg className="stat-icon-svg text-amber-500" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                          </svg>
                          <span className="profile-stat-number" style={{ color: '#f59e0b' }}>{animatedBadges}</span>
                          <span className="profile-stat-label" style={{ color: '#f59e0b' }}>badges</span>
                        </div>

                      </div>

                      {/* Upgraded Biography details */}
                      <div className="profile-bio-details-new">
                        <div className="profile-name-title-row">
                          <h3 className="profile-display-name-new">{profileOwnerUser ? profileOwnerUser.fullName : (editFullName || user.fullName)}</h3>
                          
                          {/* Restyled rare-tier rank title tag badge */}
                          <span className="profile-tag-badge rare-tier-shimmer animate-pulse-slow">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z"/>
                            </svg>
                            Professional Nomad
                          </span>
                        </div>
                        
                        {/* Bio rendered asSmall parsed keywords/chips */}
                        <div className="profile-bio-chips-row">
                          {(profileOwnerUser ? profileOwnerUser.bio : editBio).split('|').map((part: string, pIdx: number) => (
                            <span className="bio-chip animate-zoom-in" key={pIdx} style={{ animationDelay: `${pIdx * 50}ms` }}>
                              {part.trim()}
                            </span>
                          ))}
                        </div>

                        {profileOwnerUser && (
                          <div className="profile-mutual-followers-row animate-fade-in">
                            <span className="mutual-icon">👥</span>
                            <span>Followed by samantha_sky, alex_explorer and 12 others</span>
                          </div>
                        )}

                        {!profileOwnerUser && editWebsite && (
                          <a 
                            href={`https://${editWebsite}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="profile-bio-website-link hover-underline-anim"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            {editWebsite}
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Highlights Stories Circular Row */}
                <div className="profile-highlights-row-container">
                  {highlights.map((hl, idx) => (
                    <div 
                      key={hl.id} 
                      className="highlight-story-item"
                      onClick={() => {
                        setSelectedHighlight(hl.id);
                        setActiveStoryIdx(0);
                      }}
                    >
                      <div className="highlight-story-circle-wrapper">
                        <div className="highlight-story-circle-inner">
                          <img src={hl.cover} alt={hl.title} className="highlight-story-img" />
                        </div>
                      </div>
                      <span className="highlight-story-label">{hl.title}</span>
                    </div>
                  ))}
                  
                  {/* Mock Add highlight */}
                  <div className="highlight-story-item opacity-60" onClick={() => alert('Add highlight story cover feature coming soon!')}>
                    <div className="highlight-story-circle-wrapper border-dashed-add">
                      <div className="highlight-story-circle-inner flex-add-plus">
                        <span>+</span>
                      </div>
                    </div>
                    <span className="highlight-story-label">New</span>
                  </div>
                </div>

                {/* 3. Dynamic Tabs Navigation Menu */}
                <div className="profile-tabs-nav">
                  <button 
                    className={`profile-tab-btn ${profileTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setProfileTab('posts')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>POSTS</span>
                  </button>
                  
                  <button 
                    className={`profile-tab-btn ${profileTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setProfileTab('saved')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>SAVED</span>
                  </button>
                  
                  <button 
                    className={`profile-tab-btn ${profileTab === 'milestones' ? 'active' : ''}`}
                    onClick={() => setProfileTab('milestones')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>MILESTONES</span>
                  </button>
                  
                  <button 
                    className={`profile-tab-btn ${profileTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setProfileTab('settings')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>SETTINGS</span>
                  </button>
                </div>

                {/* 4. Tab Contents Grid */}
                <div className="profile-tab-content-area">
                  
                  {/* TAB A: POSTS DYNAMIC POSTCARDS GRID */}
                  {profileTab === 'posts' && (
                    <div className="profile-media-grid">
                      {userPosts.map((post) => (
                        <div 
                          key={post.id} 
                          className="profile-postcard-card"
                          onClick={() => alert(`Opening post card details: "${post.title}"`)}
                        >
                          {/* Postal Stamp element */}
                          <div className="profile-postcard-stamp">
                            <div className="profile-postcard-stamp-inner">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 2L11 13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                            </div>
                          </div>
                          {/* Polaroid Photo Frame */}
                          <div className="profile-postcard-photo-wrapper">
                            <img src={post.img} alt={post.title} className="profile-postcard-img" />
                            
                            <div className="profile-media-hover-overlay">
                              <div className="profile-media-hover-metrics">
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.comments}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Postcard handwritten info text */}
                          <div className="profile-postcard-info">
                            <h4 className="profile-postcard-title">{post.title}</h4>
                            <span className="profile-postcard-location">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '3px' }}>
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              {post.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB B: SAVED ITEMS GRID (Mocks Saved Reels) */}
                  {profileTab === 'saved' && (
                    <div className="profile-media-grid">
                      {/* Show first 3 vlogs from global vlogs to act as saved items */}
                      {vlogs.slice(0, 3).map((vlog) => (
                        <div 
                          key={vlog.id} 
                          className="profile-media-grid-item"
                          onClick={() => {
                            setActiveTab('reels');
                            const rIdx = reels.findIndex(r => r.username === vlog.username);
                            if (rIdx !== -1) setActiveReelIndex(rIdx);
                          }}
                        >
                          <img src={vlog.thumbnail} alt={vlog.title} className="profile-media-thumbnail" />
                          <div className="profile-media-hover-overlay">
                            <div className="profile-media-hover-metrics">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Play
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Plus save placeholders */}
                      <div className="profile-saved-empty-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <h4>Save Travel Guides</h4>
                        <p>Toggle bookmark save on reels to catalog guides here.</p>
                      </div>
                    </div>
                  )}

                  {/* TAB C: MILESTONES ACHIEVEMENT timeline/grid */}
                  {profileTab === 'milestones' && (
                    <div className="milestones-tab-container animate-fade-in">
                      {/* Summary stats HUD strip */}
                      <header className="milestones-stats-header">
                        <div className="stats-header-left">
                          <div className="rank-crest-title-row">
                            {/* Detailed Rank Crest SVG with easter egg click handler */}
                            <div className="rank-crest-wrapper animate-pulse-slow" onClick={handleCrestClick} title="Double-click 5 times for Developer tools">
                              <svg className="rank-crest-svg" width="36" height="36" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 5v6c0 5.5 4.5 10 9 12 4.5-2 9-6.5 9-12V5l-9-3z" fill="url(#goldRing)" stroke="#ffe082" strokeWidth="1" />
                                <path d="M12 6l1.5 3 3.5.5-2.5 2.5 1 3.5-3.5-2-3.5 2 1-3.5-2.5-2.5 3.5-.5L12 6z" fill="#1e293b" />
                              </svg>
                            </div>
                            <span className="milestones-rank-title">
                              {milestones.find(m => m.id === 'ms-4')?.unlocked ? 'Explorer Elite' : 'Explorer'} — Level 4
                            </span>
                          </div>
                          
                          {/* Animated flip/count-up badge counter */}
                          <div className="milestones-badges-ratio">
                            🏆 {animatedBadgesCount} / {milestones.length} Badges Unlocked
                          </div>
                        </div>
                        
                        {/* XP bar with count-up animated bar */}
                        <div className="milestones-xp-progress-column">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>TOTAL EXPERIENCE</span>
                            <span style={{ color: '#ec4899' }}>{animatedXP} / 3000 XP</span>
                          </div>
                          <div className="milestones-xp-track">
                            <div 
                              className="milestones-xp-fill" 
                              style={{ width: `${(animatedXP / 3000) * 100}%` }} 
                            />
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="milestones-controls-row">
                          <button 
                            type="button"
                            className="milestones-control-btn sound-toggle"
                            onClick={() => setSoundMuted(!soundMuted)}
                            title={soundMuted ? 'Unmute achievement sounds' : 'Mute achievement sounds'}
                          >
                            {soundMuted ? '🔇' : '🔊'}
                          </button>
                          
                          {/* Grid/Timeline switcher with sliding indicator */}
                          <div className="view-mode-toggle-group">
                            <div className={`sliding-indicator ${milestonesView === 'timeline' ? 'slide-right' : ''}`} />
                            <button 
                              type="button"
                              className={`view-mode-btn ${milestonesView === 'grid' ? 'active' : ''}`}
                              onClick={() => setMilestonesView('grid')}
                            >
                              Grid
                            </button>
                            <button 
                              type="button"
                              className={`view-mode-btn ${milestonesView === 'timeline' ? 'active' : ''}`}
                              onClick={() => setMilestonesView('timeline')}
                            >
                              Timeline
                            </button>
                          </div>
                        </div>
                      </header>

                      {/* Hidden Dev Panel (Visible only when double-clicked crest 5 times) */}
                      {showDevPanel && (
                        <div className="dev-cheats-panel animate-fade-in">
                          <span style={{ fontWeight: 800, fontSize: '12px' }}>🛠️ DEVELOPER TOOLS</span>
                          <button 
                            type="button"
                            className="milestones-control-btn mock-trigger-btn"
                            onClick={triggerMockUnlock}
                          >
                            {milestones.find(m => m.id === 'ms-4')?.unlocked ? 'Re-lock Trophy' : 'Test Unlock (Confetti/Conf/Sound)'}
                          </button>
                        </div>
                      )}

                      {/* Confetti particles for real-time unlock */}
                      {celebrationConfetti && (
                        <div className="confetti-particles-overlay">
                          {particlesList.map((p) => (
                            <div 
                              key={p.id}
                              className="confetti-particle"
                              style={{
                                backgroundColor: p.color,
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                width: `${Math.random() * 6 + 6}px`,
                                height: `${Math.random() * 6 + 6}px`,
                                transform: `rotate(${p.y * 5}deg)`
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* GRID VIEW */}
                      {milestonesView === 'grid' ? (
                        <div className="profile-milestones-grid">
                          {milestones.map((ms, index) => {
                            const isExpanded = expandedMilestoneId === ms.id;
                            const isTurned = tokenTurnedId === ms.id;
                            const progressFraction = getProgressFraction(ms.progress);
                            const msUnlocked = ms.unlocked;
                            
                            return (
                              <motion.div 
                                layout
                                key={ms.id} 
                                className={`milestone-card-3d-wrapper ${isExpanded ? 'is-expanded' : 'is-resting'}`}
                                style={{ animationDelay: `${index * 30}ms` }}
                              >
                                <div 
                                  className={`milestone-card-inner-mechanic ${isTurned ? 'token-turned' : ''}`}
                                  onClick={(e) => toggleCardFlip(ms.id, e)}
                                >
                                  {isExpanded ? (
                                    /* EXPANDED OPAQUE PANEL VIEW */
                                    <div className="milestone-expanded-panel animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                                      {/* Close control button */}
                                      <button 
                                        type="button" 
                                        className="panel-close-btn" 
                                        onClick={(e) => toggleCardFlip(ms.id, e)}
                                      >
                                        &times;
                                      </button>

                                      {/* Share button */}
                                      {msUnlocked && (
                                        <button 
                                          type="button"
                                          className="badge-share-icon-btn" 
                                          onClick={(e) => { e.stopPropagation(); setShareBadge(ms); }}
                                          title="Share achievement"
                                          style={{ top: '14px', right: '40px' }}
                                        >
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                            <polyline points="16 6 12 2 8 6" />
                                            <line x1="12" y1="2" x2="12" y2="15" />
                                          </svg>
                                        </button>
                                      )}

                                      {/* Rarity Ribbon Tag in corner */}
                                      <div className={`milestone-rarity-ribbon ${ms.rarity}`}>
                                        {ms.rarity.toUpperCase()}
                                      </div>

                                      {/* Large Medallion Art at Top */}
                                      <div className="panel-medallion-sphere">
                                        {renderMilestoneIcon(ms.id, 64)}
                                      </div>

                                      {/* Title & Description */}
                                      <h3 className="panel-badge-title">{ms.title}</h3>
                                      <p className="panel-badge-desc">{ms.desc}</p>

                                      {/* Clean 2x2 stats grid rows */}
                                      <div className="card-back-chips-grid">
                                        <div className="stat-chip">
                                          <svg className="chip-icon text-amber-500" width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                          </svg>
                                          <span className="chip-value">+{ms.points} XP</span>
                                        </div>
                                        
                                        <div className="stat-chip">
                                          <svg className="chip-icon text-cyan-400" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                          </svg>
                                          <span className="chip-value">{ms.rarityPercent} users</span>
                                        </div>

                                        <div className="stat-chip">
                                          <svg className="chip-icon text-rose-500" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                          </svg>
                                          <span className="chip-value">{ms.statValue}</span>
                                        </div>

                                        <div className="stat-chip">
                                          <svg className="chip-icon text-purple-400" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                                            <path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                                          </svg>
                                          <span className="chip-value" style={{ textTransform: 'capitalize' }}>{ms.rarity}</span>
                                        </div>
                                      </div>

                                      <div className="panel-footer-date">
                                        {msUnlocked ? `Unlocked: ${ms.date}` : `Progress: ${ms.progress}`}
                                      </div>
                                    </div>
                                  ) : (
                                    /* RESTING IDENTICAL BADGE VIEW */
                                    <div className={`milestone-resting-badge ${msUnlocked ? 'unlocked' : 'locked'}`}>
                                      <div className="resting-badge-outer">
                                        {/* Embedded dynamic medallion */}
                                        <div className="resting-badge-sphere">
                                          {renderMilestoneIcon(ms.id, 56)}
                                        </div>
                                        
                                        {/* Tac lock if locked */}
                                        {!msUnlocked && (
                                          <div className="milestone-tactile-lock">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        /* TIMELINE VIEW (Full Winding Road Redesign) */
                        <div className="profile-milestones-timeline winding-timeline-container">
                          
                          {/* Winding dynamic center vector line */}
                          <svg className="timeline-winding-svg" viewBox="0 0 100 1300" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="cosmicTrail" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="50%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#6366f1" />
                              </linearGradient>
                            </defs>
                            {/* Winding road path outline */}
                            <path 
                              d="M 25 40 C 25 95, 75 95, 75 150 C 75 205, 25 205, 25 260 C 25 315, 75 315, 75 370 C 75 425, 25 425, 25 480 C 25 535, 75 535, 75 590 C 75 645, 25 645, 25 700 C 25 755, 75 755, 75 810 C 75 865, 25 865, 25 920 C 25 975, 75 975, 75 1030 C 75 1085, 25 1085, 25 1140 C 25 1195, 75 1195, 75 1250"
                              fill="none" 
                              stroke="rgba(255, 255, 255, 0.05)" 
                              strokeWidth="4" 
                            />
                            {/* Winding road path active light-up line */}
                            <path 
                              className="timeline-trail-active"
                              d="M 25 40 C 25 95, 75 95, 75 150 C 75 205, 25 205, 25 260 C 25 315, 75 315, 75 370 C 75 425, 25 425, 25 480 C 25 535, 75 535, 75 590 C 75 645, 25 645, 25 700 C 25 755, 75 755, 75 810 C 75 865, 25 865, 25 920 C 25 975, 75 975, 75 1030 C 75 1085, 25 1085, 25 1140 C 25 1195, 75 1195, 75 1250"
                              fill="none" 
                              stroke="url(#cosmicTrail)" 
                              strokeWidth="4" 
                              strokeDasharray="1300"
                              strokeDashoffset="130"
                            />
                          </svg>

                          {milestones.map((ms, index) => {
                            const progressFraction = getProgressFraction(ms.progress);
                            const msUnlocked = ms.unlocked;
                            // Alternate nodes along trail left/right
                            const isLeft = index % 2 === 0;
                            const isNodeLocked = !msUnlocked;
                            
                            return (
                              <div 
                                key={ms.id}
                                className={`timeline-node-row ${isLeft ? 'row-left' : 'row-right'} ${msUnlocked ? 'unlocked' : 'locked'}`}
                                style={{ 
                                  animationDelay: `${index * 80}ms`,
                                  top: `${index * 110}px` 
                                }}
                              >
                                {/* Narrative timeline connecting distance labels */}
                                {index > 0 && (
                                  <div className="timeline-narrative-connector">
                                    <span>{getTimelineConnectionLabel(index - 1)}</span>
                                  </div>
                                )}

                                {/* Medallion sphere sitting directly on trail X point */}
                                <div 
                                  className={`timeline-node-badge-sphere ${msUnlocked ? 'unlocked' : 'locked-foggy'}`}
                                  style={{ background: ms.badgeColor }}
                                  onClick={() => setActiveTimelinePopoverId(activeTimelinePopoverId === ms.id ? null : ms.id)}
                                >
                                  {renderMilestoneIcon(ms.id, 32)}
                                  
                                  {/* Padlock Overlay for locked node */}
                                  {!msUnlocked && (
                                    <div className="timeline-node-lock">
                                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Info card sitting on side of trail */}
                                <div className="timeline-node-card-wrapper">
                                  <div 
                                    className={`timeline-mini-card ${msUnlocked ? 'unlocked' : 'locked'} ${activeTimelinePopoverId === ms.id ? 'popover-active' : ''}`}
                                    onClick={() => setActiveTimelinePopoverId(activeTimelinePopoverId === ms.id ? null : ms.id)}
                                  >
                                    <div className="timeline-mini-card-header">
                                      <h4 className="timeline-node-title">{ms.title}</h4>
                                      <span className={`milestone-rarity-pill ${ms.rarity}`}>{ms.rarity}</span>
                                    </div>
                                    <p className="timeline-node-desc">{ms.desc}</p>
                                    {msUnlocked ? (
                                      <span className="timeline-node-date">🏆 Completed {ms.date}</span>
                                    ) : (
                                      <span className="timeline-node-progress">Progress: {ms.progress}</span>
                                    )}
                                  </div>

                                  {/* Redesigned Trophy Popover showcase from node point */}
                                  {activeTimelinePopoverId === ms.id && (
                                    <div className="timeline-popover-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                                      <button type="button" className="timeline-popover-close" onClick={() => setActiveTimelinePopoverId(null)}>&times;</button>
                                      
                                      <div className="timeline-popover-header">
                                        <span className={`popover-badge-rarity ${ms.rarity}`}>{ms.rarity.toUpperCase()} TROPHY</span>
                                        <h4 className="popover-badge-title">{ms.title}</h4>
                                        <p className="popover-badge-desc">{ms.desc}</p>
                                      </div>

                                      <div className="card-back-chips-grid">
                                        <div className="stat-chip">
                                          <svg className="chip-icon text-amber-500" width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                          </svg>
                                          <span className="chip-value">+{ms.points} XP</span>
                                        </div>
                                        <div className="stat-chip">
                                          <svg className="chip-icon text-cyan-400" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                          </svg>
                                          <span className="chip-value">{ms.rarityPercent} users</span>
                                        </div>
                                        <div className="stat-chip">
                                          <svg className="chip-icon text-rose-500" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                          </svg>
                                          <span className="chip-value" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ms.statValue}</span>
                                        </div>
                                        <div className="stat-chip">
                                          <svg className="chip-icon text-purple-400" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                                            <path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                                          </svg>
                                          <span className="chip-value" style={{ textTransform: 'capitalize' }}>{ms.rarity}</span>
                                        </div>
                                      </div>

                                      {msUnlocked && (
                                        <button 
                                          type="button"
                                          className="popover-share-btn"
                                          onClick={() => { setShareBadge(ms); setActiveTimelinePopoverId(null); }}
                                        >
                                          Share Certificate
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Polaroid Share modal */}
                      {shareBadge && (
                        <div className="share-polaroid-modal-overlay" onClick={() => setShareBadge(null)}>
                          <div className="share-polaroid-card animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="polaroid-close-btn" onClick={() => setShareBadge(null)}>×</button>
                            
                            <div className="polaroid-header">
                              <span className="polaroid-brand">TRAVEHOLIC</span>
                              <span className="polaroid-badge-status">OFFICIAL TROPHY CERTIFICATE</span>
                            </div>

                            <div className="polaroid-body">
                              <div className="polaroid-badge-glow-outer" style={{ background: shareBadge.badgeColor }}>
                                {renderMilestoneIcon(shareBadge.id, 46)}
                              </div>
                              
                              <h3 className="polaroid-title">{shareBadge.title}</h3>
                              <p className="polaroid-rarity">{shareBadge.rarity.toUpperCase()} TROPHY</p>
                              
                              <div className="polaroid-divider" />
                              
                              <p className="polaroid-congrats">
                                Congratulations to <strong>{editFullName || user?.username || 'traveler'}</strong> for unlocking this travel milestone on Traveholic.
                              </p>
                              
                              <span className="polaroid-date-completed">UNLOCKED: {shareBadge.date}</span>
                            </div>

                            <div className="polaroid-footer">
                              <div className="polaroid-stamp">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>VERIFIED</span>
                              </div>
                              
                              <button 
                                type="button"
                                className="polaroid-download-btn"
                                onClick={() => { showToast('Certificate downloaded to desktop! 🏆'); setShareBadge(null); }}
                              >
                                Download Image
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB D: EDIT PROFILE SETTINGS AND ROLE MANAGMENT */}
                  {profileTab === 'settings' && (
                    <div className="profile-settings-panel">
                      <form onSubmit={(e) => { e.preventDefault(); alert('Profile settings updated successfully!'); setProfileTab('posts'); }}>
                        
                        <div className="profile-settings-form-row">
                          <div className="form-group">
                            <label className="form-label-new">Full Name</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={editFullName} 
                              onChange={(e) => setEditFullName(e.target.value)} 
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label-new">Username</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={editUsername} 
                              onChange={(e) => setEditUsername(e.target.value)} 
                              required 
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label-new">Email Address</label>
                          <input 
                            type="email" 
                            className="form-input" 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)} 
                            required 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label-new">Biography</label>
                          <textarea 
                            className="form-input-textarea" 
                            rows={3}
                            value={editBio} 
                            onChange={(e) => setEditBio(e.target.value)} 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label-new">Website Link</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="website.com"
                            value={editWebsite} 
                            onChange={(e) => setEditWebsite(e.target.value)} 
                          />
                        </div>

                        {user.role === 'traveller' && (
                          <div className="profile-vlogger-settings-toggle">
                            <div className="toggle-text-column">
                              <span className="toggle-header-label">Switch Creator Mode</span>
                              <span className="toggle-sub-label">Publish vlogs and travel maps as a verified vlogger.</span>
                            </div>
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={user.travellerType === 'vlogger'} 
                                onChange={async (e) => {
                                  const result = await updateTravellerType(e.target.checked ? 'vlogger' : 'normal');
                                  if (!result.success) alert('Failed to switch mode.');
                                }} 
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                        )}

                        <div className="profile-settings-footer-actions">
                          <button type="submit" className="btn-primary">
                            Save Changes
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                </div>

                {/* --- MODAL 1: TRAVEL STORIES STORY HIGHLIGHT VIEWER CAROUSEL (Fixed AnimatePresence) --- */}
                <AnimatePresence>
                  {selectedHighlight && (
                    <HighlightStoryModal
                      selectedHighlight={selectedHighlight}
                      setSelectedHighlight={setSelectedHighlight}
                      activeStoryIdx={activeStoryIdx}
                      setActiveStoryIdx={setActiveStoryIdx}
                      storyTimerProgress={storyTimerProgress}
                      storyImageLoaded={storyImageLoaded}
                      setStoryImageLoaded={setStoryImageLoaded}
                      highlights={highlights}
                      user={user}
                      renderAvatar={renderAvatar}
                    />
                  )}
                </AnimatePresence>



              </div>
            )}
          </div>

        </div>

        {/* MOBILE ONLY: Bottom Tab Navigation footer bar */}
        <footer className="mobile-bottom-tabs">
          <button className={`social-tab-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button className={`social-tab-item ${(activeTab === 'search' && !showSearchDrawer) || showSearchDrawer ? 'active' : ''}`} onClick={() => { setActiveTab('search'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button className={`social-tab-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => { setActiveTab('create'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button className={`social-tab-item ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => { setActiveTab('reels'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill={activeTab === 'reels' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button className={`social-tab-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => { setActiveTab('messages'); setShowSearchDrawer(false); setShowNotificationsDrawer(false); }}>
            <svg width="24" height="24" fill={activeTab === 'messages' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </footer>

        {/* --- PERSISTENT FLOATING AI CHATBOT BUBBLE --- */}
        <div 
          className="ai-chatbot-floating-bubble" 
          style={{ 
            zIndex: 101,
            bottom: isMiniInboxOpen ? '500px' : '80px',
            transition: 'bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} 
          onClick={() => setAiChatOpen(!aiChatOpen)}
        >
          <img src="/ai-guide.png" alt="AI" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* AI Chat drawer pane */}
        {aiChatOpen && (
          <div 
            className="ai-chatbot-panel" 
            style={{ 
              zIndex: 102,
              bottom: isMiniInboxOpen ? '570px' : '150px',
              transition: 'bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div className="ai-chatbot-header">
              <span className="ai-chatbot-title">
                <img src="/ai-guide.png" alt="AI Guide" style={{ width: '20px', height: '20px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                Travora AI Planner
              </span>
              <button className="ai-chatbot-close" onClick={() => setAiChatOpen(false)}>×</button>
            </div>
            
            <div className="ai-chatbot-messages">
              {aiChatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-chat-bubble ${msg.sender === 'ai' ? 'ai' : 'user'}`}>
                  {msg.text.split('\n').map((line, lineIdx) => {
                    if (line.startsWith('**') || line.startsWith('-')) {
                      return <div key={lineIdx} style={{ margin: '4px 0', fontWeight: line.startsWith('**') ? 'bold' : 'normal' }}>{line.replace(/\*\*/g, '')}</div>;
                    }
                    return <p key={lineIdx} style={{ margin: '2px 0' }}>{line}</p>;
                  })}
                </div>
              ))}
              {aiTyping && (
                <div className="ai-chat-bubble ai" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Typing suggestions...
                </div>
              )}
            </div>

            <form className="ai-chatbot-input-bar" onSubmit={handleSendAiMessage}>
              <input 
                type="text" 
                className="ai-chatbot-input" 
                placeholder="Ask about itineraries, Bali, Manali..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <button type="submit" className="ai-chatbot-send-btn" aria-label="Send query">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* --- FLOATING MESSAGES TRAY --- */}
        {user && (
          <div className="floating-messages-tray-container">
            {!isMiniInboxOpen ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Floating Notification Bell Button */}
                <div 
                  className={`floating-notifications-pill spring-active ${showBellNotifications ? 'active' : ''}`}
                  onClick={() => setShowBellNotifications(!showBellNotifications)}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="notifications-pill-badge">{unreadNotifications}</span>
                    )}
                  </div>
                </div>

                {/* Floating Notifications Dropdown Panel */}
                {showBellNotifications && (
                  <div className="floating-notifications-panel discover-premium-card animate-slide-up" style={{ zIndex: 120 }}>
                    <div className="notifications-panel-header">
                      <span>Notifications</span>
                      <button className="notifications-close-btn" onClick={() => setShowBellNotifications(false)}>&times;</button>
                    </div>
                    <div className="notifications-panel-list">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="notification-panel-item" onClick={() => { setShowBellNotifications(false); showToast(`Viewing @${notif.username}'s action`); }}>
                          <span className="notification-avatar">
                            {notif.avatar.startsWith('http') || notif.avatar.startsWith('https') ? (
                              <img src={notif.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              notif.avatar
                            )}
                          </span>
                          <div className="notification-content">
                            <span className="notification-username">@{notif.username}</span> {notif.text}
                            <span className="notification-time">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Pill */}
                <div className="floating-messages-pill spring-active" onClick={() => setIsMiniInboxOpen(true)}>
                  <div className="floating-messages-pill-left">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-15deg)' }}>
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      <span className="messages-pill-badge">2</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '14px', marginLeft: '8px' }}>Messages</span>
                  </div>
                  <div className="floating-messages-pill-avatars">
                    <div className="floating-messages-pill-avatar-item">
                      {renderAvatar('backpacker_sam', 24)}
                    </div>
                    <div className="floating-messages-pill-avatar-item">
                      {renderAvatar('wanderlust_jenny', 24)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`floating-messages-drawer ${isExpandingFullscreen ? 'expanding-fullscreen' : ''}`}>
                {/* Header */}
                <div className="floating-messages-drawer-header">
                  <div className="drawer-header-left">
                    {miniSlideActive && (
                      <button 
                        className="drawer-header-back-btn" 
                        onClick={() => {
                          setMiniSlideActive(false);
                          setTimeout(() => {
                            setMiniActiveChatBuddy(null);
                          }, 350);
                        }} 
                        aria-label="Back to chats"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                    )}
                    <span className="drawer-chat-username" style={{ fontSize: '15px', fontWeight: 800 }}>
                      {miniSlideActive && miniActiveChatBuddy ? `@${miniActiveChatBuddy}` : 'Messages'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!miniSlideActive && (
                      <button 
                        className="drawer-header-btn" 
                        onClick={() => {
                          setIsExpandingFullscreen(true);
                          setTimeout(() => {
                            setActiveTab('messages');
                            setIsMiniInboxOpen(false);
                            setIsExpandingFullscreen(false);
                          }, 450);
                        }}
                        title="Open full page"
                        aria-label="Expand to full screen"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </button>
                    )}
                    <button 
                      className="drawer-header-btn" 
                      onClick={() => { 
                        setIsMiniInboxOpen(false); 
                        setMiniSlideActive(false);
                        setMiniActiveChatBuddy(null); 
                      }} 
                      title="Minimize messages"
                      aria-label="Minimize messages"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Main Body with Sliding Track */}
                <div className="drawer-sliding-track-wrapper">
                  <div 
                    className="drawer-sliding-track"
                    style={{ 
                      transform: miniSlideActive ? 'translateX(-50%)' : 'translateX(0%)' 
                    }}
                  >
                    {/* PANEL 1: Chat List */}
                    <div className="drawer-sliding-panel panel-list">
                      {/* Search inside tray */}
                      <div className="drawer-search-wrapper">
                        <input 
                          type="text" 
                          placeholder="Search chats..." 
                          className="drawer-search-input"
                          value={miniSearchQuery}
                          onChange={(e) => setMiniSearchQuery(e.target.value)}
                        />
                      </div>
                      {/* Chat Buddies List */}
                      <div className="drawer-chats-list">
                        {Object.keys(conversations)
                          .filter(buddy => buddy.toLowerCase().includes(miniSearchQuery.toLowerCase()))
                          .map((buddy) => {
                            const chatMsgs = conversations[buddy] || [];
                            const lastMsg = chatMsgs[chatMsgs.length - 1];
                            const lastMsgText = lastMsg ? (lastMsg.sender === 'me' ? `You: ${lastMsg.text}` : lastMsg.text) : 'No messages yet';
                            return (
                              <div 
                                key={buddy} 
                                className="drawer-chat-item" 
                                onClick={() => {
                                  setMiniActiveChatBuddy(buddy);
                                  setMiniSlideActive(true);
                                }}
                              >
                                {renderAvatar(buddy, 36)}
                                <div className="drawer-chat-info">
                                  <span className="drawer-chat-username" style={{ fontWeight: 600, fontSize: '13px' }}>{buddy}</span>
                                  <span className="drawer-chat-lastmsg">{lastMsgText}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* PANEL 2: Active Chat Conversation */}
                    <div className="drawer-sliding-panel panel-chat">
                      {miniActiveChatBuddy ? (
                        <>
                          {/* Message Bubble List */}
                          <div className="drawer-chat-messages" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
                            {(conversations[miniActiveChatBuddy] || []).map((msg, mIdx) => (
                              <div key={mIdx} className={`drawer-msg-bubble ${msg.sender === 'me' ? 'me' : 'them'}`}>
                                {msg.text}
                              </div>
                            ))}
                          </div>
                          {/* Input Area */}
                          <form className="drawer-chat-input-area" onSubmit={handleSendMiniMessage}>
                            <input 
                              type="text" 
                              placeholder="Message..." 
                              className="drawer-chat-input-field"
                              value={miniChatInput}
                              onChange={(e) => setMiniChatInput(e.target.value)}
                            />
                            <button type="submit" className="drawer-chat-send-btn" disabled={!miniChatInput.trim()}>
                              Send
                            </button>
                          </form>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                          Select a conversation
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- FULLSCREEN STORY VIEWER MODAL OVERLAY --- */}
        {showStoryViewer && activeImageStories[activeStoryIndex] && (
          <div className="story-viewer-overlay" style={{ zIndex: 200 }}>
            <div className="story-viewer-container">
              <div className="story-progress-bar-row">
                {activeImageStories.map((_, barIdx) => (
                  <div key={barIdx} className="story-progress-bar-bg">
                    <div 
                      className="story-progress-bar-fill" 
                      style={{ width: barIdx === activeStoryIndex ? `${storyProgress}%` : barIdx < activeStoryIndex ? '100%' : '0%' }} 
                    />
                  </div>
                ))}
              </div>

              <div className="story-viewer-header">
                <div className="story-viewer-user">
                  <div className="story-viewer-avatar">
                    {activeImageStories[activeStoryIndex].avatar && (activeImageStories[activeStoryIndex].avatar.startsWith('http') || activeImageStories[activeStoryIndex].avatar.startsWith('https')) ? (
                      <img src={activeImageStories[activeStoryIndex].avatar} alt={activeImageStories[activeStoryIndex].username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      activeImageStories[activeStoryIndex].avatar || '👤'
                    )}
                  </div>
                  <div>
                    <div className="story-viewer-name">{activeImageStories[activeStoryIndex].username}</div>
                    <span className="story-viewer-time">Travel Buddy</span>
                  </div>
                </div>
                <button className="story-viewer-close" onClick={() => setShowStoryViewer(false)}>×</button>
              </div>

              <div className="story-viewer-body">
                {activeStoryIndex > 0 && (
                  <button className="story-viewer-nav prev" onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(prev => prev - 1); }}>◀</button>
                )}
                <img src={activeImageStories[activeStoryIndex].image} alt="Story content" className="story-viewer-img" />
                <div className="story-viewer-caption">{activeImageStories[activeStoryIndex].caption}</div>
                {activeStoryIndex < activeImageStories.length - 1 && (
                  <button className="story-viewer-nav next" onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(prev => prev + 1); }}>▶</button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- GLOBAL TOAST SYSTEM --- */}
        <div className="toast-notifications-container">
          {toasts.map((t) => (
            <div key={t.id} className="custom-toast-notification discover-premium-card animate-slide-up">
              <span className="toast-icon">✨</span>
              <span className="toast-message">{t.message}</span>
            </div>
          ))}
        </div>

      </div>
     </>
    );
  }

  return (
    <>
      {showSplash && (
        <div className={`splash-container ${fadeClass}`}>
          <div className="splash-logo-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Logo theme={theme} width={130} showText={true} />
            <div className="splash-progress-bar">
              <div className="splash-progress-line" />
            </div>
          </div>
        </div>
      )}
      <div className="split-screen-container">
        {/* Ambient Background Glow Blobs */}
        <div className="bg-glow-container">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>

      {/* --- LEFT PANEL: Branding & Visual Showcase --- */}
      <div className="left-pane">
        <Logo theme={theme} width={120} />
        <h2 className="left-brand-text">
          See everyday moments from your <span className="gradient-text">travel buddies</span>.
        </h2>
        <p className="left-brand-sub">
          The unified travel network connecting vloggers, explorers, hotels, and agencies.
        </p>

        {/* CSS-based overlapping phone screen cards stack */}
        <div className="cards-stack-container">
          {/* Phone Card 1: Traveller Hike */}
          <div className="phone-card phone-card-1">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#f4a261' }} />
              <span className="phone-username">wander_sam</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #2a9d8f, #e76f51)' }}>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 600 }}>
                🏔️ Manali peaks
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">First summit! 🌄 #wanderlust</span>
            </div>
          </div>

          {/* Phone Card 2: Hotel/Stay Provider */}
          <div className="phone-card phone-card-2">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#e76f51' }} />
              <span className="phone-username">villa_goa</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #1d3557, #457b9d)' }}>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 600 }}>
                🌴 Luxury Stays
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">Book private villas direct! 🌊</span>
            </div>
          </div>

          {/* Phone Card 3: Vlogger Stream */}
          <div className="phone-card phone-card-3">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#2a9d8f' }} />
              <span className="phone-username">nomad_vlogs</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045)' }}>
              <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', padding: '2px 5px', borderRadius: '3px', fontSize: '7px', fontWeight: 800 }}>
                LIVE
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">Exploring hidden waterfalls... 💦</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Interactive Form & Context --- */}
      <div className="right-pane">

        {/* Top-Right Header Actions */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 50 }}>
          {user && (
            <button
              onClick={logout}
              className="theme-toggle-btn"
              style={{ position: 'static' }}
              aria-label="Log Out"
              title="Log Out"
            >
              {/* Door Exit Logout Icon */}
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 13v-2H10V9l-5 3 5 3v-2h6zM20 3H9c-1.1 0-2 .9-2 2v4h2V5h11v14H9v-4H7v4c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{ position: 'static' }}
            aria-label="Toggle dark/light mode"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.7.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2.2-4.2 5.7-3.6 9.3.8 4.4 4.5 7.8 9 8.1 2.3.1 4.5-.6 6.2-2 .4-.3.9-.3 1.3-.1.4.3.6.8.5 1.3-.8 4.7-4.9 8-9.7 8.3z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0-5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1V3c0-.6.4-1 1-1zm0 14c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2c0-.6.4-1 1-1zM4 12c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1H5c-.6 0-1-.4-1-1zm14 0c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1h-2c-.6 0-1-.4-1-1zM5.2 6.6c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4s-1 .4-1.4 0L5.2 8c-.4-.4-.4-1 0-1.4zm10.6 10.6c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4s-1 .4-1.4 0l-1.4-1.4c-.4-.4-.4-1 0-1.4zm0-10.6c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0zM7.2 16.2c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0z" />
              </svg>
            )}
          </button>
        </div>



        {/* --- Form Context Inner Wrapper --- */}
        <div className={`form-inner-wrapper ${(contentVisible || user) ? 'visible' : ''}`}>

          {/* Logo Header (re-appears at top of form) */}
          <div className="logo-header">
            <Logo theme={theme} width={90} />
          </div>

            {/* --- Sign In / Sign Up Forms View --- */}
            <div style={{ width: '100%' }}>

              {/* Form Feedback */}
              {errorMsg && <div className="status-msg error">{errorMsg}</div>}
              {successMsg && <div className="status-msg success">{successMsg}</div>}

              {formMode === 'login' ? (
                /* --- LOG IN VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ display: 'none' }}>Log into Travora</h2>
                  <p className="form-subtitle" style={{ display: 'none' }}>Log in to see photos and videos from your travel buddies.</p>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Mobile number, username or email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log in'}
                  </button>

                  <a className="text-link-center" href="#forgot" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}>
                    Forgot password?
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 18px', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }}></div>
                  </div>

                  {/* Switch to SignUp Outline Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setFormMode('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setPassword(''); // Clear shared password state
                    }}
                  >
                    Create new account
                  </button>
                </form>
              ) : (
                /* --- SIGN UP VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Get started on Travora</h2>
                  <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Sign up to see photos and videos from your friends.</p>

                  {/* Traveller vs Venture Sub-tabs */}
                  <div className="tabs-container" style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      className={`tab-btn ${userRole === 'traveller' ? 'active' : ''}`}
                      onClick={() => { setUserRole('traveller'); setErrorMsg(''); }}
                    >
                      Traveller
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${userRole === 'business' ? 'active' : ''}`}
                      onClick={() => { setUserRole('business'); setErrorMsg(''); }}
                    >
                      Ventures
                    </button>
                  </div>

                  {/* 1. Email and Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-input-container">
                        <input
                          type="email"
                          name="signup-email-new"
                          className="form-input"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div className="form-input-container">
                        <input
                          type="tel"
                          name="signup-phone-new"
                          className="form-input"
                          placeholder="Phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          pattern="\d{10}"
                          title="10-digit phone number"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Honeypots to trap browser autofill */}
                  <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                    <input type="text" name="fake-email" tabIndex={-1} autoComplete="username" />
                    <input type="password" name="fake-password" tabIndex={-1} autoComplete="current-password" />
                  </div>

                  {/* 2. Password with visibility toggle */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="signup-new-secure-password"
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <PasswordChecklist pwd={password} />
                  </div>

                  {/* 3. Birthday */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Birthday</label>
                    <div className="birthday-grid">
                      <select className="form-input" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Month</option>
                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="form-input" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Day</option>
                        {days.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className="form-input" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 4. Full Name */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 5. Username */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Traveller Onboard Fields */}
                  {userRole === 'traveller' ? (
                    <div className="toggle-group">
                      <div>
                        <span className="toggle-title">Join as a Travel Vlogger</span>
                        <span className="toggle-desc" style={{ display: 'block' }}>Share journeys as a vlogger.</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isVlogger}
                          onChange={(e) => setIsVlogger(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ) : (
                    /* Ventures Onboard Fields */
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Venture Name (Agency/Stay)"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                        <select
                          className="form-input"
                          value={businessType}
                          onChange={(e: any) => setBusinessType(e.target.value)}
                          style={{ padding: '12px 10px' }}
                        >
                          <option value="agency">Agency / Tour</option>
                          <option value="hotel">Hotel / Stay</option>
                        </select>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="License No."
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                          required
                          pattern="^[A-Z0-9]{8,15}$"
                          title="Must be 8-15 uppercase letters or numbers"
                          autoComplete="off"
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Venture Street Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Website URL (Optional)"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Submit'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setFormMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setPassword(''); // Clear shared password state
                    }}
                  >
                    I already have an account
                  </button>
                </form>
              )}

              {/* Page Footer Navigation Links */}
              <div className="page-footer">
                <div className="footer-nav">
                  <a className="footer-nav-link" href="#about">About</a>
                  <a className="footer-nav-link" href="#blog">Blog</a>
                  <a className="footer-nav-link" href="#jobs">Jobs</a>
                  <a className="footer-nav-link" href="#help">Help</a>
                  <a className="footer-nav-link" href="#api">API</a>
                  <a className="footer-nav-link" href="#privacy">Privacy</a>
                  <a className="footer-nav-link" href="#terms">Terms</a>
                  <a className="footer-nav-link" href="#locations">Locations</a>
                </div>
                <div className="footer-copy">
                  © 2026 Travora
                </div>
              </div>

            </div>

        </div>

      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {forgotError && <div className="status-msg error">{forgotError}</div>}
            {forgotSuccess && <div className="status-msg success">{forgotSuccess}</div>}

            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter your email or phone number and we'll send you a link to get back into your account.</p>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Email or Phone Number" value={forgotIdentifier} onChange={(e) => setForgotIdentifier(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotStep2}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter the 6-digit OTP sent to your device.</p>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Enter OTP" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 600 }} />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleForgotStep3}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Enter your new password.</p>
                <div className="form-group">
                  <input type="password" className="form-input" placeholder="New Password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} required minLength={8} />
                  <PasswordChecklist pwd={forgotNewPassword} />
                </div>
                <div className="form-group">
                  <input type="password" className="form-input" placeholder="Confirm Password" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} required minLength={8} />
                </div>
                <button type="submit" className="btn-primary" disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Post Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 4, 10, 0.95)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out'
            }}
          >
            <motion.button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              src={lightboxImage}
              alt="Lightbox"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(236, 72, 153, 0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
   </>
  );
}
