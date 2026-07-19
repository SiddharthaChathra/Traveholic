'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function AccountPrivacyPage() {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(false);

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Account privacy</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Control who can see your travel journals and locations</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Toggle Panel Card */}
        <div 
          className="discover-premium-card" 
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Private account</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Only approved followers can view your travel posts and map pins.</span>
          </div>
          <ToggleSwitch checked={isPrivate} onChange={setIsPrivate} />
        </div>

        {/* Informational Explanatory Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            When your account is public, your profile and posts can be seen by anyone, on or off Travora, even if they don't have a Travora account.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            When your account is private, only the followers you approve can see what you share, including your photos, videos on hashtag and location pages, and following lists. Certain info on your profile remains visible to everyone.
          </p>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="button"
            onClick={() => {
              alert('Account privacy preference saved successfully!');
              router.push('/settings');
            }}
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Privacy Settings
          </button>
        </div>

      </div>
    </div>
  );
}
