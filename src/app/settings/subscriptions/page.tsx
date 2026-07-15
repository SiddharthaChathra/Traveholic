'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SponsorPerk {
  partner: string;
  perk: string;
  promoCode: string;
}

interface Subscription {
  id: string;
  creatorName: string;
  username: string;
  avatar: string;
  tier: string;
  unlockedPerks: SponsorPerk[];
}

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    creatorName: 'Sophia Loren',
    username: 'sophia_travels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    tier: 'VIP Explorer ($4.99/mo)',
    unlockedPerks: [
      { partner: 'Sea Breeze Luxury Villa Bali 🌴', perk: 'Free Floating Breakfast & Welcome Cocktail', promoCode: 'SOPHIAFREE' },
      { partner: 'Ubud Canopy Tours 🧗', perk: '15% Off Half-Day Jungle Zipline Treks', promoCode: 'SOPHIA15' }
    ]
  },
  {
    id: 'sub-2',
    creatorName: 'Marcus Brody',
    username: 'marcus_vlogs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tier: 'Backpack Patron ($1.99/mo)',
    unlockedPerks: [
      { partner: 'Hanoi Street Food Markets 🍜', perk: 'Free Tasting Platter & Cultural Guide Map', promoCode: 'MARCUSFOOD' },
      { partner: 'Halong Bay Kayaking 🛶', perk: '10% Off Private Bay Tour Packages', promoCode: 'MARCUS10' }
    ]
  }
];

export default function CreatorSubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleClaimPerk = (code: string) => {
    navigator.clipboard.writeText(code);
    localStorage.setItem('active_sponsorship_code', code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    alert(`Code "${code}" Claimed! Code has been pre-applied for your next booking checkout on the Map.`);
  };

  const handleUnsubscribe = (id: string) => {
    if (confirm("Are you sure you want to cancel this creator subscription?")) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Creator Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Manage premium vlogger channels you support monthly</p>
        </div>
      </div>

      {subscriptions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {subscriptions.map(sub => (
            <div 
              key={sub.id} 
              className="discover-premium-card"
              style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Vlogger details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img src={sub.avatar} alt={sub.creatorName} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{sub.creatorName}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{sub.username} • <span style={{ color: '#fbbf24', fontWeight: 600 }}>{sub.tier}</span></span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleUnsubscribe(sub.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Unsubscribe
                </button>
              </div>

              {/* VIP Perks pass */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>🎟️</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Sponsor VIP Pass Perks Unlocked
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sub.unlockedPerks.map((perk, pIdx) => (
                    <div 
                      key={pIdx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                          {perk.partner}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {perk.perk}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleClaimPerk(perk.promoCode)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '8px 14px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(16,185,129,0.2)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Claim Code
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Illustration Styled like Travora's premium illustrations */
        <div 
          className="discover-premium-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 32px',
            borderRadius: '24px',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--brand-gradient)',
            padding: '2px',
            boxShadow: '0 0 20px rgba(236,72,153,0.3)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--bg-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>No active subscriptions</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: '1.6', margin: 0 }}>
              You aren't subscribed to any premium traveler channels yet. Subscribe to vloggers to unlock custom itinerary maps, exclusive stories, and badges.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Explore Creators
            </button>
            <button
              onClick={() => setSubscriptions(DEFAULT_SUBSCRIPTIONS)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)',
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset Mock Channels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
