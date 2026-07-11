'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import { useSettings } from '@/context/SettingsContext';

export default function AccessibilityPage() {
  const router = useRouter();
  const { reduceMotion, setReduceMotion } = useSettings();
  
  // States
  const [textSize, setTextSize] = useState('standard');
  const [autoCaptions, setAutoCaptions] = useState(true);

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Accessibility</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Configure display options, motion preferences, and subtitle captions</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Reduce Motion Card */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Motion Preferences</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Reduce Motion</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '500px', display: 'block' }}>Disable non-essential spring, parallax, glow, and hover animations app-wide for improved readability and speed.</span>
            </div>
            <ToggleSwitch checked={reduceMotion} onChange={setReduceMotion} />
          </div>
        </div>

        {/* Text Size Card */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Display Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Text Size</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['small', 'standard', 'large'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextSize(size)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: textSize === size ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                    background: textSize === size ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                    color: textSize === size ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Captions Card */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Captions and Subtitles</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Auto-generated captions</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically generate closed caption subtitles for travel vlogs and video posts.</span>
            </div>
            <ToggleSwitch checked={autoCaptions} onChange={setAutoCaptions} />
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="button"
            onClick={() => {
              alert('Accessibility preferences saved successfully!');
              router.push('/settings');
            }}
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
