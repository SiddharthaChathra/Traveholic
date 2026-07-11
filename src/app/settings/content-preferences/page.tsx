'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RadioCard from '@/components/shared/RadioCard';

export default function ContentPreferencesPage() {
  const router = useRouter();
  const [filterLevel, setFilterLevel] = useState('standard');

  const options = [
    { value: 'more', label: 'More', description: 'Show more recommendation logs and potentially sensitive posts. Less filtering.' },
    { value: 'standard', label: 'Standard (Recommended)', description: 'Default safety settings. Balance between visibility and filter rules.' },
    { value: 'less', label: 'Less', description: 'Hide most sensitive content. Aggressive filtering for younger audiences.' }
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Content Preferences</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Control what recommended travel posts you see from accounts you don't follow</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Radio group list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Sensitive content levels</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>Choose the level of filtering applied to non-followed profiles on explore cards and feeds.</p>
          
          <RadioCard 
            options={options} 
            selectedValue={filterLevel} 
            onChange={setFilterLevel} 
            columns={1}
          />
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="button" 
            onClick={() => {
              alert('Sensitive content preferences updated!');
              router.push('/settings');
            }} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Content Preference
          </button>
        </div>

      </div>
    </div>
  );
}
