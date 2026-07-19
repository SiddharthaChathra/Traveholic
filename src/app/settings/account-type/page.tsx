'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RadioCard from '@/components/shared/RadioCard';

export default function AccountTypeToolsPage() {
  const router = useRouter();
  const { user, updateTravellerType } = useAuth();

  const defaultUser = {
    username: 'shashank._s',
    role: 'traveller',
    travellerType: 'normal'
  };

  const activeUser = user || defaultUser;
  
  // State
  const [selectedType, setSelectedType] = useState(
    activeUser.role === 'business' ? 'venture' : activeUser.travellerType === 'vlogger' ? 'vlogger' : 'traveler'
  );

  const accountOptions = [
    { 
      value: 'traveler', 
      label: 'Traveler Account', 
      description: 'Standard account. Browse destinations, bookmark itineraries, and write comments.' 
    },
    { 
      value: 'vlogger', 
      label: 'Vlogger Creator', 
      description: 'Unlock video story publishing, map logs creation, and live-broadcast broadcasts.' 
    },
    { 
      value: 'venture', 
      label: 'Venture Partner', 
      description: 'Business account. Sell packages, list hotels, sponsor vloggers, and view trust scores.' 
    }
  ];

  const handleSwitch = async (value: string) => {
    if (value === 'traveler') {
      if (activeUser.role === 'business') {
        localStorage.setItem('user_view_mode', 'traveller');
        alert('Switched to Traveler View');
        router.push('/');
      } else {
        await updateTravellerType('normal');
        alert('Switched to Standard Traveler Account');
      }
    } else if (value === 'vlogger') {
      if (activeUser.role === 'business') {
        localStorage.setItem('user_view_mode', 'traveller');
        await updateTravellerType('vlogger');
        alert('Switched to Vlogger Creator Account');
        router.push('/');
      } else {
        await updateTravellerType('vlogger');
        alert('Switched to Vlogger Creator Account');
      }
    } else if (value === 'venture') {
      // Simulate switching to venture role or opening venture signup
      if (activeUser.role !== 'business') {
        if (confirm('Would you like to upgrade your profile to a Travora Venture Account? This allows listing stays and selling packages.')) {
          // If we want to simulate role change:
          alert('Upgrading profile to Travora Venture... Welcome to Venture Partner Dashboard!');
          localStorage.removeItem('user_view_mode');
          router.push('/venture/dashboard');
        }
      } else {
        localStorage.removeItem('user_view_mode');
        router.push('/venture/dashboard');
      }
    }
    setSelectedType(value);
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Account Type & Tools</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Switch account types between Traveler, Vlogger, and Venture</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Info panel */}
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
          Travora provides unique features for each profile type. Travelers focus on exploration, Vloggers create immersive maps and guides, while Ventures manage commercial listings and sponsorships.
        </p>

        {/* Choice list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <RadioCard 
            options={accountOptions} 
            selectedValue={selectedType} 
            onChange={handleSwitch} 
            columns={1}
          />
        </div>

        {/* Venture specific dashboard settings shortcut link */}
        {activeUser.role === 'business' && (
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
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Venture Dashboard Settings</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Configure business registration number, VAT, tax metadata, and policies.</span>
            </div>
            <button
              onClick={() => router.push('/venture/settings')}
              className="btn-primary"
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
            >
              Go to Venture Settings
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
