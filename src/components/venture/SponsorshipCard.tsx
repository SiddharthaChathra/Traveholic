'use client';

import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface TravelerProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  engagementRate: number;
  niche: string[];
  countryFocus: string;
  bio: string;
}

interface SponsorshipCardProps {
  traveler?: TravelerProfile;
  swipeable?: boolean;
  onSwipeRight?: (id: string) => void;
  onSwipeLeft?: (id: string) => void;
  activeDealProgress?: {
    delivered: number;
    total: number;
    campaignName: string;
    contractValue: number;
  };
  style?: React.CSSProperties;
}

export default function SponsorshipCard({
  traveler,
  swipeable = false,
  onSwipeRight,
  onSwipeLeft,
  activeDealProgress,
  style
}: SponsorshipCardProps) {
  // Tinder Swipe setup
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!traveler) return;
    const swipeThreshold = 120;
    if (info.offset.x > swipeThreshold) {
      onSwipeRight?.(traveler.id);
    } else if (info.offset.x < -swipeThreshold) {
      onSwipeLeft?.(traveler.id);
    }
  };

  // Helper for follower count formatting
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  // Renders Active Deal Progress circular widget
  if (activeDealProgress && traveler) {
    const percentage = (activeDealProgress.delivered / activeDealProgress.total) * 100;
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div 
        className="discover-premium-card" 
        style={{
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          ...style
        }}
      >
        <img 
          src={traveler.avatar} 
          alt={traveler.name} 
          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
        />
        
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{traveler.name}</h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeDealProgress.campaignName}</span>
          <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Contract: <span style={{ color: 'var(--text-primary)' }}>${activeDealProgress.contractValue}</span>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--glass-border-subtle, rgba(255,255,255,0.05))" strokeWidth="4" />
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              fill="none" 
              stroke="url(#progressGrad)" 
              strokeWidth="4" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activeDealProgress.delivered}/{activeDealProgress.total}
          </span>
        </div>
      </div>
    );
  }

  if (!traveler) return null;

  const cardContent = (
    <div 
      className="discover-premium-card" 
      style={{
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        userSelect: 'none'
      }}
    >
      <div style={{ position: 'relative', height: '220px', width: '100%' }}>
        <img 
          src={traveler.avatar} 
          alt={traveler.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', zIndex: 5 }}>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0 }}>{traveler.name}</h4>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>@{traveler.username}</span>
        </div>
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>{traveler.countryFocus}</span>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Key Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: 'var(--glass-bg-flat, rgba(255,255,255,0.02))', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.04))' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>FOLLOWERS</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{formatFollowers(traveler.followers)}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>ENGAGEMENT</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>{traveler.engagementRate}%</span>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: '1.4' }}>{traveler.bio}</p>
        </div>

        <div>
          {/* Niche tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {traveler.niche.map((tag, idx) => (
              <span 
                key={idx} 
                style={{ 
                  background: 'rgba(236,72,153,0.06)', 
                  border: '1px solid rgba(236,72,153,0.12)', 
                  borderRadius: '12px', 
                  padding: '3px 8px', 
                  fontSize: '9px', 
                  fontWeight: 600, 
                  color: 'var(--primary)' 
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (swipeable) {
    return (
      <motion.div
        style={{
          x,
          rotate,
          opacity,
          width: '320px',
          height: '420px',
          cursor: 'grab',
          position: 'absolute',
          ...style
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.015, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)' }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25 }}
      style={{ width: '100%', height: '100%', ...style }}
    >
      {cardContent}
    </motion.div>
  );
}
