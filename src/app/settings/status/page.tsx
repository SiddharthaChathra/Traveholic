'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface StatusRowItem {
  title: string;
  desc: string;
  status: 'good' | 'warning' | 'critical';
}

export default function AccountStatusPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentTier, setCurrentTier] = useState('Platinum');
  const [milesBalance, setMilesBalance] = useState(12450);

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName);
    }
  }, [user]);

  const activeUser = {
    username: user?.username || 'user',
    fullName: fullName,
    avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.username || 'user')}`
  };

  const statusItems: StatusRowItem[] = [
    { 
      title: 'Removed content & messaging issues', 
      desc: 'Verify if any travel guides, routes, or chats violated Travora terms of service.', 
      status: 'good' 
    },
    { 
      title: 'Availability to people under 18', 
      desc: 'Checks if your vlogs and photos meet age rating requirements for minor travelers.', 
      status: 'good' 
    },
    { 
      title: 'Features you can\'t use', 
      desc: 'Check list of locks or limits currently placed on features due to report warnings.', 
      status: 'good' 
    }
  ];

  const renderStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    if (status === 'good') {
      return (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      );
    }
    if (status === 'warning') {
      return (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
      );
    }
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => router.push('/settings')}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--card-border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Account Status</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Check your standing profile rules and restriction logs</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Status Summary Card */}
        <div 
          className="discover-premium-card" 
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.06)' }}>
            <img src={activeUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{activeUser.fullName}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{activeUser.username}</span>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '11px',
            color: '#34d399',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Account in Good Standing
          </div>
        </div>

        {/* Status Rows */}
        <div 
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {statusItems.map((item, idx) => (
            <div 
              key={item.title}
              onClick={() => alert(`Opening status audit: ${item.title}...`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: idx < statusItems.length - 1 ? '1px solid var(--card-border)' : 'none',
                transition: 'background 0.2s ease'
              }}
              className="settings-list-item-hover"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '85%' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {renderStatusIcon(item.status)}
                <div style={{ color: 'var(--text-muted)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
