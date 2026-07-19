'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RadioCard from '@/components/shared/RadioCard';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function CommentsPage() {
  const router = useRouter();

  // States
  const [commentPermission, setCommentPermission] = useState('followers');
  const [allowGifs, setAllowGifs] = useState(true);

  const commentOptions = [
    { value: 'everyone', label: 'Everyone', description: 'Allow comments from all Travora users' },
    { value: 'followers', label: 'Your followers', description: 'Only allow your 598 followers' },
    { value: 'mutuals', label: 'Followers you follow back', description: 'Only allow the 531 mutual profiles' },
    { value: 'none', label: 'Off', description: 'Turn off commenting on your posts entirely' }
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Comments</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Choose who can comment on your travel logs and allow GIFs</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Allow comments from */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Allow comments from</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>Filter comments based on relationship status and profile connection counts.</p>
          <RadioCard 
            options={commentOptions} 
            selectedValue={commentPermission} 
            onChange={setCommentPermission} 
            columns={2}
          />
        </div>

        {/* Allow GIF comments toggle */}
        <div 
          className="discover-premium-card" 
          style={{ 
            padding: '20px 24px', 
            borderRadius: '16px', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Allow GIF comments</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>People will be able to comment Giphy animations on your posts and itineraries.</span>
          </div>
          <ToggleSwitch checked={allowGifs} onChange={setAllowGifs} />
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button 
            type="button" 
            onClick={() => {
              alert('Comment settings updated!');
              router.push('/settings');
            }} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Comments Preference
          </button>
        </div>

      </div>
    </div>
  );
}
