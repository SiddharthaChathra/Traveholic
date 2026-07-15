'use client';

import React, { useState } from 'react';
import TabBar from '@/components/shared/TabBar';
import SponsorshipCard from '@/components/venture/SponsorshipCard';
import Link from 'next/link';

interface TravelerProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  engagementRate: number;
  niche: string[];
  countryFocus: string;
  bio: string;
}

export default function VentureSponsorshipsPage() {
  const [activeTab, setActiveTab] = useState('browse');
  const [travelerIndex, setTravelerIndex] = useState(0);

  const travelers: TravelerProfile[] = [
    {
      id: 'trav-1',
      name: 'Sophia Loren',
      username: 'sophia_travels',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      followers: 125000,
      engagementRate: 4.8,
      niche: ['Vlogger', 'Adventure', 'Luxury'],
      countryFocus: 'Indonesia',
      bio: 'Creating high-energy adventure reels and aesthetic luxury hotel reviews across Southeast Asia.'
    },
    {
      id: 'trav-2',
      name: 'Marcus Brody',
      username: 'marcus_vlogs',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      followers: 82000,
      engagementRate: 5.2,
      niche: ['Backpacker', 'Budget', 'Culture'],
      countryFocus: 'Vietnam',
      bio: 'Deep diving into local food culture, street markets, and remote jungle hikes.'
    },
    {
      id: 'trav-3',
      name: 'Jenna Ortega',
      username: 'jenna_explores',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      followers: 320000,
      engagementRate: 3.9,
      niche: ['Luxury', 'Hotels', 'Fashion'],
      countryFocus: 'Maldives',
      bio: 'Fashion traveler showcasing luxury stays, resort experiences, and beachfront relaxation.'
    }
  ];

  // Incoming Applications
  const [incomingApps, setIncomingApps] = useState([
    {
      id: 'app-1',
      traveler: travelers[1], // Marcus
      proposal: 'I would like to create 2 dedicated vlogs on YouTube showing the resort spa amenities and garden layout in exchange for a 3-night stay.',
      requestedDates: 'Aug 10 - Aug 13, 2026',
      status: 'pending'
    },
    {
      id: 'app-2',
      traveler: travelers[2], // Jenna
      proposal: 'Proposal to create 3 Instagram reels showcasing the private beachfront sunset pool view.',
      requestedDates: 'Sep 02 - Sep 05, 2026',
      status: 'pending'
    }
  ]);

  // Active Deals
  const [activeDeals, setActiveDeals] = useState([
    {
      id: 'deal-1',
      traveler: travelers[0], // Sophia
      progress: {
        delivered: 2,
        total: 4,
        campaignName: 'Bali Luxury Escape Vlog Series',
        contractValue: 1200
      }
    }
  ]);

  const [promoCodes, setPromoCodes] = useState<any[]>([]);

  React.useEffect(() => {
    const defaultCodes = [
      {
        code: 'SOPHIA10',
        creator: 'Sophia Loren',
        username: 'sophia_travels',
        discount: '10% Discount',
        status: 'Active',
        impressions: 1420,
        clicks: 340,
        bookingsCount: 8,
        totalRevenue: 24500,
        commissionPaid: 1225
      }
    ];
    const saved = localStorage.getItem('traveholic_sponsorship_codes');
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = [...defaultCodes];
      parsed.forEach((p: any) => {
        if (!merged.some(m => m.code === p.code)) {
          merged.push(p);
        }
      });
      setPromoCodes(merged);
    } else {
      localStorage.setItem('traveholic_sponsorship_codes', JSON.stringify(defaultCodes));
      setPromoCodes(defaultCodes);
    }
  }, []);

  const handleSwipeRight = (id: string) => {
    const trav = travelers.find(t => t.id === id);
    if (trav) {
      const code = (trav.username.split('_')[0] + '10').toUpperCase();
      const newCodeObj = {
        code,
        creator: trav.name,
        username: trav.username,
        discount: '10% Discount',
        status: 'Active',
        impressions: 0,
        clicks: 0,
        bookingsCount: 0,
        totalRevenue: 0,
        commissionPaid: 0
      };

      const saved = JSON.parse(localStorage.getItem('traveholic_sponsorship_codes') || '[]');
      if (!saved.some((c: any) => c.code === code)) {
        const updated = [...saved, newCodeObj];
        localStorage.setItem('traveholic_sponsorship_codes', JSON.stringify(updated));
        localStorage.setItem('active_sponsorship_code', code);
        setPromoCodes(prev => {
          if (!prev.some(m => m.code === code)) {
            return [...prev, newCodeObj];
          }
          return prev;
        });
      }
      alert(`Sponsorship Offer Sent to ${trav.name}! Co-branded referral code "${code}" is now Active.`);
    }
    setTravelerIndex(prev => prev + 1);
  };

  const handleSwipeLeft = () => {
    setTravelerIndex(prev => prev + 1);
  };

  const handleAcceptApp = (appId: string, travelerName: string) => {
    const app = incomingApps.find(a => a.id === appId);
    if (app) {
      const username = app.traveler.username;
      const code = (username.split('_')[0] + '15').toUpperCase();
      const newCodeObj = {
        code,
        creator: app.traveler.name,
        username: app.traveler.username,
        discount: '15% Discount',
        status: 'Active',
        impressions: 0,
        clicks: 0,
        bookingsCount: 0,
        totalRevenue: 0,
        commissionPaid: 0
      };

      const saved = JSON.parse(localStorage.getItem('traveholic_sponsorship_codes') || '[]');
      if (!saved.some((c: any) => c.code === code)) {
        const updated = [...saved, newCodeObj];
        localStorage.setItem('traveholic_sponsorship_codes', JSON.stringify(updated));
        localStorage.setItem('active_sponsorship_code', code);
        setPromoCodes(prev => {
          if (!prev.some(m => m.code === code)) {
            return [...prev, newCodeObj];
          }
          return prev;
        });
      }
      alert(`Approved application from ${travelerName}! Co-branded promo code "${code}" is now active.`);
    }
    setIncomingApps(incomingApps.filter(app => app.id !== appId));
  };

  const handleDeclineApp = (appId: string) => {
    setIncomingApps(incomingApps.filter(app => app.id !== appId));
  };

  const tabs = [
    { id: 'browse', label: 'Browse Travelers' },
    { id: 'incoming', label: 'Incoming Applications' },
    { id: 'active', label: 'Active Deals' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Sponsorship Marketplace
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Discover travel vloggers, sponsor content creation, and track marketing deliverables.
          </p>
        </div>

        <Link 
          href="/venture/sponsorships/offer/new"
          style={{
            textDecoration: 'none',
            background: 'var(--brand-gradient)',
            color: 'white',
            fontWeight: 700,
            fontSize: '13px',
            padding: '12px 24px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="btn-shimmer-sweep"
        >
          Create Offer Template
        </Link>
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Tab Content Panels */}
      {activeTab === 'browse' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '20px 0' }}>
          {/* Swipe Card Stack Area */}
          <div style={{ position: 'relative', width: '320px', height: '440px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {travelerIndex < travelers.length ? (
              // Stacked cards logic (highest index at bottom)
              travelers.slice(travelerIndex).reverse().map((trav, idx, arr) => {
                const isTop = idx === arr.length - 1;
                return (
                  <SponsorshipCard
                    key={trav.id}
                    traveler={trav}
                    swipeable={isTop}
                    onSwipeRight={handleSwipeRight}
                    onSwipeLeft={handleSwipeLeft}
                    style={{
                      position: 'absolute',
                      transform: `scale(${1 - (arr.length - 1 - idx) * 0.04}) translateY(${(arr.length - 1 - idx) * -12}px)`,
                      zIndex: idx
                    }}
                  />
                );
              })
            ) : (
              <div className="discover-premium-card" style={{ width: '320px', height: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', textAlign: 'center', padding: '24px' }}>
                <span style={{ fontSize: '28px' }}>🎉</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>End of Card Stack</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>You have reviewed all available vloggers. Try refreshing or updating filters.</span>
                <button 
                  onClick={() => setTravelerIndex(0)}
                  style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
                >
                  Reload Stack
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {travelerIndex < travelers.length && (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button 
                onClick={handleSwipeLeft}
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                title="Skip"
              >
                ✕
              </button>
              <Link 
                href="/venture/sponsorships/offer/new"
                style={{
                  textDecoration: 'none',
                  padding: '12px 24px',
                  background: 'var(--brand-gradient)',
                  color: 'white',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '13px',
                  boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                className="btn-shimmer-sweep"
              >
                Send Direct Offer
              </Link>
              <button 
                onClick={() => handleSwipeRight(travelers[travelerIndex].id)}
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                title="Sponsor"
              >
                ♥
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'incoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {incomingApps.map(app => (
            <div 
              key={app.id} 
              className="discover-premium-card" 
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                gap: '24px'
              }}
            >
              <img 
                src={app.traveler.avatar} 
                alt={app.traveler.name} 
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {app.traveler.name} (@{app.traveler.username})
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Focus: {app.traveler.countryFocus} • Followers: {app.traveler.followers.toLocaleString()}</span>
                    
                    {/* Verified Badges Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Eligibility Checked
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {app.traveler.username === 'marcus_vlogs' && (
                          <>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', color: 'var(--text-secondary)' }}>
                              🌙 Night Owl
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', color: 'var(--text-secondary)' }}>
                              💖 Local Fav
                            </span>
                          </>
                        )}
                        {app.traveler.username === 'jenna_explores' && (
                          <>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', color: 'var(--text-secondary)' }}>
                              🏅 First Flight
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', color: 'var(--text-secondary)' }}>
                              🌍 Culture Seeker
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    Dates: {app.requestedDates}
                  </span>
                </div>
                
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '12px 0 16px', lineHeight: '1.5', fontStyle: 'italic' }}>
                  “{app.proposal}”
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleAcceptApp(app.id, app.traveler.name)}
                    style={{ background: 'var(--brand-gradient)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(236,72,153,0.2)' }}
                  >
                    Accept Application
                  </button>
                  <button 
                    onClick={() => handleDeclineApp(app.id)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px 20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}

          {incomingApps.length === 0 && (
            <div className="discover-premium-card" style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No incoming applications at this time.</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {activeDeals.map(deal => (
              <SponsorshipCard 
                key={deal.id} 
                traveler={deal.traveler} 
                activeDealProgress={deal.progress} 
              />
            ))}
          </div>

          {/* Co-Branded Referral Code Tracking Table */}
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)' }}>
              🔑 Co-Branded Sponsorship Promo Codes &amp; ROI Tracking
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 8px' }}>Creator</th>
                    <th style={{ padding: '10px 8px' }}>Promo Code</th>
                    <th style={{ padding: '10px 8px' }}>Discount Offer</th>
                    <th style={{ padding: '10px 8px' }}>Impressions</th>
                    <th style={{ padding: '10px 8px' }}>Conversions</th>
                    <th style={{ padding: '10px 8px' }}>Total Sales (USD)</th>
                    <th style={{ padding: '10px 8px' }}>Commission Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((p, idx) => {
                    const currentBookings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('traveholic_bookings') || '[]') : [];
                    const codeBookings = currentBookings.filter((b: any) => b.referralCode === p.code.toUpperCase());
                    const bookingsCount = p.bookingsCount + codeBookings.length;
                    const totalRevenue = p.totalRevenue + codeBookings.reduce((sum: number, b: any) => sum + b.price, 0);
                    const commissionPaid = p.commissionPaid + codeBookings.reduce((sum: number, b: any) => sum + b.commission, 0);

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>{p.creator}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#ec4899', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, letterSpacing: '1px' }}>
                            {p.code}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{p.discount}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{p.impressions + (codeBookings.length * 12)}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: bookingsCount > 0 ? '#10b981' : 'var(--text-muted)' }}>{bookingsCount}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '12px 8px', color: '#eab308', fontWeight: 700 }}>${commissionPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
