'use client';

import React, { useState } from 'react';
import StatCard from '@/components/venture/StatCard';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import Link from 'next/link';

interface PackageItem {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  isFeatured: boolean;
  views: number;
  bookingsCount: number;
  conversionRate: number;
}

export default function VenturePackagesPage() {
  const [packages, setPackages] = useState<any[]>([
    {
      id: 'pack-1',
      name: 'Bali Getaway Adventure (Stay + Tour)',
      durationDays: 5,
      price: 899,
      isFeatured: true,
      views: 1204,
      bookingsCount: 42,
      conversionRate: 3.4,
      isGroupTrip: false
    },
    {
      id: 'pack-2',
      name: 'Ubud Jungle Honeymoon Suite Bundle',
      durationDays: 3,
      price: 650,
      isFeatured: false,
      views: 843,
      bookingsCount: 18,
      conversionRate: 2.1,
      isGroupTrip: false
    },
    {
      id: 'pack-gt-default',
      name: '🌴 Co-Created Ubud Zen Group Trip with @sophia_travels',
      durationDays: 4,
      price: 499,
      isFeatured: true,
      views: 520,
      bookingsCount: 3,
      minTravelers: 5,
      hostCommission: 12,
      conversionRate: 5.7,
      isGroupTrip: true
    }
  ]);

  React.useEffect(() => {
    const saved = localStorage.getItem('traveholic_created_packages');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPackages(prev => {
        const merged = [...prev];
        parsed.forEach((p: any) => {
          if (!merged.some(m => m.id === p.id)) {
            merged.push(p);
          }
        });
        return merged;
      });
    }
  }, []);

  // discount states
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [expiryDate, setExpiryDate] = useState('2026-08-31');

  const handleToggleFeatured = (id: string, currentVal: boolean) => {
    setPackages(packages.map(p => p.id === id ? { ...p, isFeatured: !currentVal } : p));
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Promo Code ${promoCode} created successfully!`);
    setPromoCode('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Packages &amp; Offers
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Bundle services, create seasonal discounts, and track promotional conversions.
          </p>
        </div>

        <Link 
          href="/venture/packages/new"
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Build Package Bundle
        </Link>
      </div>

      {/* Package performance overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <StatCard title="TOTAL PACKAGE VIEWS" value={2047} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>} />
        <StatCard title="BUNDLE BOOKINGS" value={60} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} />
        <StatCard title="AVG CONVERSION RATE" value={2.8} suffix="%" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>} />
      </div>

      {/* Main Grid: Packages list & Promo creation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Packages List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Active Bundles</h3>
          
          {packages.map(p => {
            const isConfirmed = p.bookingsCount >= (p.minTravelers || 5);
            return (
              <div 
                key={p.id} 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{p.name}</h4>
                      {p.isGroupTrip && (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.2)', color: '#f59e0b', borderRadius: '20px' }}>
                          👥 Group Trip
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <span>Duration: <strong>{p.durationDays} Days</strong></span>
                      <span>Price: <strong>${p.price}</strong></span>
                      <span>Views: <strong>{p.views}</strong></span>
                      <span>Bookings: <strong>{p.bookingsCount}</strong></span>
                      {p.isGroupTrip && <span>Co-Host Comm: <strong>{p.hostCommission}%</strong></span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>FEATURED PROMO</span>
                      <span style={{ fontSize: '11px', color: p.isFeatured ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}>
                        {p.isFeatured ? 'Active slot' : 'Inactive'}
                      </span>
                    </div>
                    <ToggleSwitch checked={p.isFeatured} onChange={() => handleToggleFeatured(p.id, p.isFeatured)} />
                  </div>
                </div>

                {/* If group trip, render progress bar */}
                {p.isGroupTrip && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>Occupancy Meter:</strong> {p.bookingsCount} of {p.minTravelers || 5} seats booked
                      </span>
                      <span style={{ color: isConfirmed ? '#10b981' : '#eab308', fontWeight: 800 }}>
                        {isConfirmed ? '✓ Confirmed (Holds Charged)' : '⏳ Awaiting Min Occupancy (Holds Authorized)'}
                      </span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min((p.bookingsCount / (p.minTravelers || 5)) * 100, 100)}%`,
                        height: '100%',
                        background: isConfirmed ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #eab308 0%, #fbbf24 100%)',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>
                    
                    {/* Simulate Traveler Join (Booking) button for testing */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button 
                        onClick={() => {
                          setPackages(packages.map(item => item.id === p.id ? { ...item, bookingsCount: item.bookingsCount + 1 } : item));
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        + Simulate Traveler Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Promo Creator */}
        <div>
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Create Discount Code</h3>
            
            <form onSubmit={handleCreatePromo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Promo Code</label>
                <input 
                  type="text" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER15"
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Discount Percentage (%)</label>
                <input 
                  type="number" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  min={5}
                  max={90}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Expiry Date</label>
                <input 
                  type="date" 
                  value={expiryDate} 
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <button 
                type="submit"
                style={{ width: '100%', padding: '12px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}
              >
                Generate Promo Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
