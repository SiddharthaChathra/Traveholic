'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function AccountTypeToolsPage() {
  const router = useRouter();
  const { user, savedAccounts, switchAccount, logout, removeAccount, logoutAll } = useAuth();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitchAccount = async (userId: string) => {
    setSwitching(userId);
    const result = await switchAccount(userId);
    setSwitching(null);
    if (result.success) {
      // If switched to a business account, redirect to venture dashboard
      // Otherwise stay on the settings page
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Account Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Manage and switch between your authenticated accounts</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Info panel */}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
          Travora provides unique features for each profile type. Travelers focus on exploration, while Venture partners manage commercial listings. You must maintain separate accounts for different roles.
        </p>

        {/* Saved Accounts list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Saved Accounts on This Device</h3>
          
          {savedAccounts.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No additional accounts saved. Use "Add an Existing Account" below to add one.
            </p>
          )}

          {savedAccounts.map((account, idx) => (
            <div 
              key={account.userId + '-' + idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: user?.id === account.userId ? 'rgba(236, 72, 153, 0.08)' : 'var(--card-bg)',
                border: `1px solid ${user?.id === account.userId ? 'var(--primary)' : 'var(--card-border)'}`,
                borderRadius: '12px',
                opacity: account.sessionExpired ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px' }}>
                  {(account.username)[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>@{account.username}</div>
                  <div style={{ fontSize: '12px', color: account.sessionExpired ? '#ef4444' : 'var(--text-muted)', marginTop: '2px' }}>
                    {account.sessionExpired 
                      ? 'Session expired — please log in again'
                      : `${account.role === 'business' ? 'Venture Partner' : account.travellerType === 'vlogger' ? 'Vlogger Creator' : 'Traveler'}${user?.id === account.userId ? ' • Active' : ''}`
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {user?.id !== account.userId && !account.sessionExpired && (
                  <button 
                    onClick={() => handleSwitchAccount(account.userId)}
                    disabled={switching === account.userId}
                    className="btn-primary"
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, opacity: switching === account.userId ? 0.5 : 1 }}
                  >
                    {switching === account.userId ? 'Switching...' : 'Switch'}
                  </button>
                )}
                <button 
                  onClick={() => removeAccount(account.userId)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Add Account button */}
          <button 
            onClick={() => {
              window.location.href = '/?action=add_account';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'transparent',
              border: '1px dashed var(--card-border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--card-border)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add an Existing Account
          </button>

          {/* Logout All button */}
          {savedAccounts.length > 1 && (
            <button 
              onClick={async () => {
                await logoutAll();
                router.push('/');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out All Accounts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
