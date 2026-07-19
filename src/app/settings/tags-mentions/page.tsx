'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RadioCard from '@/components/shared/RadioCard';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function TagsMentionsPage() {
  const router = useRouter();

  // States
  const [tagPermission, setTagPermission] = useState('everyone');
  const [mentionPermission, setMentionPermission] = useState('everyone');
  const [manualApproval, setManualApproval] = useState(false);

  const tagOptions = [
    { value: 'everyone', label: 'Everyone', description: 'Allow tagging from all Travora profiles' },
    { value: 'following', label: 'People you follow', description: 'Only allow profiles you follow to tag you' },
    { value: 'none', label: 'No one', description: 'Block all profile tagging actions' }
  ];

  const mentionOptions = [
    { value: 'everyone', label: 'Everyone', description: 'Allow mentions from all Travora profiles' },
    { value: 'following', label: 'People you follow', description: 'Only allow profiles you follow to mention you' },
    { value: 'none', label: 'No one', description: 'Block all profile mentions' }
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Tags & Mentions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Control who can tag or mention you in travel logs, posts, and itineraries</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Who can tag you */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Who can tag you</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>Choose who can tag your profile in their travel photos and itinerary videos.</p>
          <RadioCard 
            options={tagOptions} 
            selectedValue={tagPermission} 
            onChange={setTagPermission} 
            columns={3}
          />
        </div>

        {/* Manual approvals toggle */}
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
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Manually approve tags</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Review and manually approve tags before they appear on your profile.</span>
          </div>
          <ToggleSwitch checked={manualApproval} onChange={setManualApproval} />
        </div>

        {/* Who can mention you */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Who can @mention you</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>Choose who can mention your profile to link to it in their stories, comments, or bio descriptions.</p>
          <RadioCard 
            options={mentionOptions} 
            selectedValue={mentionPermission} 
            onChange={setMentionPermission} 
            columns={3}
          />
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button 
            type="button" 
            onClick={() => {
              alert('Tag and mention preferences saved successfully!');
              router.push('/settings');
            }} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Rules
          </button>
        </div>

      </div>
    </div>
  );
}
