'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorSubscriptionsPage() {
  const router = useRouter();

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Creator Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Manage premium vlogger channels you support monthly</p>
        </div>
      </div>

      {/* Empty State Illustration Styled like Travora's premium illustrations */}
      <div 
        className="discover-premium-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 32px',
          borderRadius: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          textAlign: 'center',
          gap: '24px'
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--brand-gradient)',
          padding: '2px',
          boxShadow: '0 0 20px rgba(236,72,153,0.3)'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'var(--bg-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>No active subscriptions</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: '1.6', margin: 0 }}>
            You aren't subscribed to any premium traveler channels yet. Subscribe to vloggers to unlock custom itinerary maps, exclusive stories, and badges.
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="btn-primary"
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Explore Creators
        </button>
      </div>

    </div>
  );
}
