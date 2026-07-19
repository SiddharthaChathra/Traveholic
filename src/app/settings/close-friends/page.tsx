'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TravelBuddy {
  username: string;
  fullName: string;
  avatar: string;
  checked: boolean;
}

export default function CloseFriendsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [buddies, setBuddies] = useState<TravelBuddy[]>([
    { username: 'nomad_vlogs', fullName: 'Nomad Vlogs', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', checked: true },
    { username: 'backpacker_sam', fullName: 'Backpacker Sam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', checked: false },
    { username: 'wanderlust_jenny', fullName: 'Wanderlust Jenny', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', checked: false },
    { username: 'nomad_alex', fullName: 'Nomad Alex', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', checked: false },
    { username: 'stay_luxury_bali', fullName: 'Stay Luxury Bali', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=stay', checked: false }
  ]);

  const toggleBuddy = (username: string) => {
    setBuddies(buddies.map(b => b.username === username ? { ...b, checked: !b.checked } : b));
  };

  const filteredBuddies = buddies.filter(b => 
    b.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Inner Circle</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Manage friends who can see your exclusive stories and routes</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Info Box */}
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          We don't send notifications when you edit your Inner Circle list. People in this list will see a green badge on your stories and live broadcasts.
        </p>

        {/* Search Input */}
        <div 
          className="search-input-wrapper"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <svg 
            width="15" 
            height="15" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ color: 'var(--text-muted)' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search travel buddies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              width: '100%'
            }}
          />
        </div>

        {/* Buddies List */}
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
          {filteredBuddies.map((buddy, idx) => (
            <div 
              key={buddy.username}
              onClick={() => toggleBuddy(buddy.username)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                cursor: 'pointer',
                borderBottom: idx < filteredBuddies.length - 1 ? '1px solid var(--card-border)' : 'none',
                transition: 'background 0.2s ease'
              }}
              className="settings-list-item-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                  <img src={buddy.avatar} alt={buddy.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{buddy.username}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{buddy.fullName}</span>
                </div>
              </div>

              {/* Blue checkmark indicator */}
              <div 
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: buddy.checked ? 'none' : '2px solid rgba(255,255,255,0.2)',
                  background: buddy.checked ? 'var(--primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {buddy.checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          ))}

          {filteredBuddies.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No travel buddies found
            </div>
          )}
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button 
            type="button" 
            onClick={() => {
              alert('Inner Circle list updated successfully!');
              router.push('/settings');
            }} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Friends List
          </button>
        </div>

      </div>
    </div>
  );
}
