'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function MessagesRepliesPage() {
  const router = useRouter();
  
  // States
  const [allowRequests, setAllowRequests] = useState(true);
  const [allowReplies, setAllowReplies] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Messages & Replies</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Control direct chat requests, replies, and online active status</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Messages controls */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>How people can reach you</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--card-border)', paddingTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Message requests</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allow message requests from travelers who don't follow you.</span>
              </div>
              <ToggleSwitch checked={allowRequests} onChange={setAllowRequests} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Story replies</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allow other explorers to reply directly to your active travel stories.</span>
              </div>
              <ToggleSwitch checked={allowReplies} onChange={setAllowReplies} />
            </div>
          </div>
        </div>

        {/* Activity status controls */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Who can see you're online</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--card-border)', paddingTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Show activity status</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allow accounts you follow and anyone you message to see when you were last active or are currently online in chat list.</span>
              </div>
              <ToggleSwitch checked={showOnlineStatus} onChange={setShowOnlineStatus} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => {
              alert('Message and reply preferences updated!');
              router.push('/settings');
            }} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
