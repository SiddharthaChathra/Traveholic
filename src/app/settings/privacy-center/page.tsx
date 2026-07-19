'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyCenterPage() {
  const router = useRouter();

  const privacyArticles = [
    { title: 'Your Privacy on Travora', desc: 'An overview of how we protect your travel logs and map telemetry.' },
    { title: 'Data Policy', desc: 'Details on the location history, pictures, and guide telemetry we store.' },
    { title: 'Terms of Service', desc: 'Explains rules of engagement for traveler, vlogger, and business partner profiles.' },
    { title: 'Cookie Policy', desc: 'How we store offline settings, theme states, and traveler preferences.' }
  ];

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Privacy Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Understand how we secure your data and location history</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Info panel */}
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          At Travora, we believe you own your travel stories. Read the documentation below to understand how your location sharing, map logs, private chats, and partner booking logs are processed.
        </p>

        {/* Article list */}
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
          {privacyArticles.map((article, idx) => (
            <div 
              key={article.title}
              onClick={() => alert(`Opening privacy policy: ${article.title}...`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: idx < privacyArticles.length - 1 ? '1px solid var(--card-border)' : 'none',
                transition: 'background 0.2s ease'
              }}
              className="settings-list-item-hover"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{article.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{article.desc}</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
