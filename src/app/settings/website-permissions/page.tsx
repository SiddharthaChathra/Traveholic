'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectedApp {
  id: string;
  name: string;
  domain: string;
  logo: string;
  connectedDate: string;
  permissions: string[];
}

export default function WebsitePermissionsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<ConnectedApp[]>([
    { 
      id: 'app-1', 
      name: 'Leaflet Maps Pro', 
      domain: 'leafletmapspro.com', 
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=leaflet',
      connectedDate: 'Joined July 04, 2025',
      permissions: ['Read public travel logs', 'Read active location coordinates', 'Sync saved map places']
    },
    { 
      id: 'app-2', 
      name: 'Vlog Studio Sync', 
      domain: 'vlogstudiosync.co', 
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=vlog',
      connectedDate: 'Joined June 18, 2025',
      permissions: ['Upload videos to stories', 'Read profile follower status']
    }
  ]);

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke permissions for ${name}?`)) {
      setApps(apps.filter(app => app.id !== id));
      alert(`Revoked access for ${name}`);
    }
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Website Permissions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Manage third-party travel apps and widget OAuth tokens connected to your profile</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Info panel */}
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          These are websites and applications you've connected to your Travora profile to sync travel itineraries, maps, and media recordings. You can revoke permissions at any time.
        </p>

        {/* Connected Apps list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {apps.map(app => (
            <div 
              key={app.id}
              className="discover-premium-card"
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                    <img src={app.logo} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{app.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.domain} &bull; {app.connectedDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(app.id, app.name)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="settings-revoke-btn-hover"
                >
                  Revoke
                </button>
              </div>

              {/* Permissions list */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '12px 16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Active Permissions</span>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {app.permissions.map((perm, idx) => (
                    <li key={idx} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{perm}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {apps.length === 0 && (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}>
              No connected travel applications
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
