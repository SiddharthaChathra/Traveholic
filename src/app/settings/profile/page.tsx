'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateTravellerType } = useAuth();

  // States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Traveler, hiker, and visual storyteller exploring the hidden valleys of Southeast Asia.');
  const [website, setWebsite] = useState('');
  const [isVlogger, setIsVlogger] = useState(user?.travellerType === 'vlogger');
  const [avatar, setAvatar] = useState(user?.avatarUrl || (user?.username ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}` : ''));

  // Update states when user loads
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setUsername(user.username);
      setEmail(user.email);
      setIsVlogger(user.travellerType === 'vlogger');
      setAvatar(user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username)}`);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile settings saved successfully!');
    router.push('/settings');
  };

  const handleAvatarChange = () => {
    // Simulate photo change
    const newSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${newSeed}`;
    setAvatar(newAvatar);
    alert('Profile photo updated!');
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Edit Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Customize your public profile, rank status, and links</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Header Redesign (Avatar, bio links, rank) */}
        <div 
          className="discover-premium-card" 
          style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}
        >
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid var(--primary)',
              boxShadow: '0 0 15px rgba(236,72,153,0.3)',
              background: 'var(--bg-gradient)'
            }}>
              <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            {/* Rank badge on edges */}
            <div 
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: 'var(--brand-gradient)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 5v6c0 5.5 4.5 10 9 12 4.5-2 9-6.5 9-12V5l-9-3z" />
              </svg>
              Lvl 4
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>@{username}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nomad Ranking: Elite Explorer</span>
          </div>

          <button 
            type="button"
            onClick={handleAvatarChange}
            style={{
              background: 'var(--btn-secondary-bg)',
              border: '1px solid var(--btn-secondary-border)',
              color: 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Change Photo
          </button>
        </div>

        {/* Edit Inputs */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
              />
            </div>
            
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Biography</label>
            <textarea 
              rows={3}
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Website Link</label>
            <input 
              type="text" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="my-travel-blog.com"
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Creator mode toggler */}
        {user?.role === 'traveller' && (
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Switch Creator Mode</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Publish vlogs, map itineraries, and stream live as a verified vlogger.</span>
            </div>
            <ToggleSwitch 
              checked={isVlogger} 
              onChange={async (val) => {
                setIsVlogger(val);
                const res = await updateTravellerType(val ? 'vlogger' : 'normal');
                if (!res.success) {
                  alert('Failed to switch creator mode.');
                  setIsVlogger(!val);
                }
              }} 
            />
          </div>
        )}

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}>
            Save Profile Changes
          </button>
        </div>

      </form>
    </div>
  );
}
