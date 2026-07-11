'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function ArchivingDownloadingPage() {
  const router = useRouter();
  const [saveToArchive, setSaveToArchive] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'requesting' | 'success'>('idle');

  const handleRequestDownload = () => {
    setDownloadStatus('requesting');
    setTimeout(() => {
      setDownloadStatus('success');
    }, 2000);
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Archiving & Downloading</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Control story auto-saves and request copies of your data</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Archiving Card */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Saving to archive</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Save story to archive</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '500px', display: 'block' }}>Automatically save photos, videos, and map routes to your archive so you don't have to save them to your phone gallery. Only you can view your archive.</span>
            </div>
            <ToggleSwitch checked={saveToArchive} onChange={setSaveToArchive} />
          </div>
        </div>

        {/* Downloading Card */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Request Data Backup</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Get a ZIP copy of all your travel logs, photo assets, active map itineraries, and chat records.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            {downloadStatus === 'idle' && (
              <button
                type="button"
                onClick={handleRequestDownload}
                className="btn-primary"
                style={{ width: 'fit-content', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
              >
                Request Download File
              </button>
            )}

            {downloadStatus === 'requesting' && (
              <button
                type="button"
                disabled
                className="btn-primary"
                style={{ width: 'fit-content', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, opacity: 0.6, cursor: 'not-allowed' }}
              >
                Processing ZIP Request...
              </button>
            )}

            {downloadStatus === 'success' && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#34d399'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Request submitted!</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>We are preparing your data copy. An email with download details will be sent shortly.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="button"
            onClick={() => {
              alert('Archiving preferences updated!');
              router.push('/settings');
            }}
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
