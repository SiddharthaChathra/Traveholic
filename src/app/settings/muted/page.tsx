'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MutedAccount {
  username: string;
  avatar: string;
  muteType: string;
}

export default function MutedAccountsPage() {
  const router = useRouter();
  const [muted] = useState<MutedAccount[]>([
    { username: 'nomad_vlogs', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', muteType: 'Story muted' },
    { username: 'backpacker_sam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', muteType: 'Posts muted' },
    { username: 'wanderlust_jenny', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', muteType: 'Story muted' }
  ]);

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Muted Accounts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Check which accounts you have silenced on your homepage feed or story scrolls</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Info panel */}
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          Muting someone hides their posts, stories, or live broadcasts from appearing on your homepage, but they can still interact with you and follow your profile.
        </p>

        {/* Muted List */}
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
          {muted.map((acc, idx) => (
            <div 
              key={acc.username}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: idx < muted.length - 1 ? '1px solid var(--card-border)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                  <img src={acc.avatar} alt={acc.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{acc.username}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{acc.muteType}</span>
                </div>
              </div>

              {/* View profile button */}
              <button
                onClick={() => {
                  router.push(`/?tab=profile`); // deep link mock back to home profile
                  alert(`Navigating to profile of @${acc.username}`);
                }}
                style={{
                  background: 'var(--btn-secondary-bg)',
                  border: '1px solid var(--btn-secondary-border)',
                  color: 'var(--text-primary)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="settings-unblock-btn-hover"
              >
                View profile
              </button>
            </div>
          ))}

          {muted.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No muted accounts
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
