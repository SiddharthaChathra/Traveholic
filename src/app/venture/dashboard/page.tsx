'use client';

import React from 'react';
import StatCard from '@/components/venture/StatCard';
import ChartCard from '@/components/shared/ChartCard';
import Link from 'next/link';

export default function VentureDashboardPage() {
  const chartDataBookings = [8, 12, 10, 15, 11, 14, 12, 16, 14, 18, 15, 20];
  const chartDataRevenue = [12000, 14500, 13000, 16000, 15000, 17500, 16500, 19000, 18000, 21000, 19500, 24500];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [extraRevenue, setExtraRevenue] = React.useState(0);
  const [extraBookings, setExtraBookings] = React.useState(0);
  const [recentBookings, setRecentBookings] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('traveholic_bookings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const rev = parsed.reduce((sum: number, b: any) => sum + b.price, 0);
      setExtraRevenue(rev);
      setExtraBookings(parsed.length);
      setRecentBookings(parsed);
    }
  }, []);

  const activities = [
    ...recentBookings.map((b: any) => ({
      id: b.id,
      type: 'booking',
      title: `Referral Booking at ${b.hotel.split(',')[0]}`,
      desc: `${b.guests} guests • Code: ${b.referralCode} • Comm: $${b.commission}`,
      time: 'Just now',
      color: '#10b981',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    })),
    {
      id: 'act-1',
      type: 'booking',
      title: 'New Booking by Emma Watson',
      desc: 'Deluxe Ocean Suite • 3 nights • $750',
      time: '10 mins ago',
      color: '#3b82f6',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 21H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z" />
          <path d="M16 5V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      )
    },
    {
      id: 'act-2',
      type: 'review',
      title: '5-Star Review received',
      desc: '“Amazing beachfront view and excellent staff support!” - Johnathan Doe',
      time: '1 hour ago',
      color: '#fbbf24',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      id: 'act-3',
      type: 'sponsorship',
      title: 'Sponsorship Inquiry from vlog_nomad',
      desc: 'Wants to feature Deluxe Suite in upcoming video series.',
      time: '3 hours ago',
      color: '#ec4899',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header section */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Overview Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Track real-time performance, booking occupancy, and incoming travelers sponsorship deals.
        </p>
      </div>

      {/* Stats list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StatCard 
          title="TODAY'S BOOKINGS" 
          value={12 + extraBookings} 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCard 
          title="REVENUE THIS MONTH" 
          value={24500 + extraRevenue} 
          prefix="$"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCard 
          title="OCCUPANCY RATE" 
          value={82} 
          suffix="%"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
          trend={{ value: 2.1, isPositive: false }}
        />
        <StatCard 
          title="AVERAGE RATING" 
          value={4.8} 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
          trend={{ value: 0.4, isPositive: true }}
        />
        <StatCard 
          title="PROFILE VIEWS" 
          value={1840} 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
          trend={{ value: 14.2, isPositive: true }}
        />
      </div>

      {/* Grid for charts & activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Analytics Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ChartCard 
            title="Bookings Analytics (Yearly)" 
            subtitle="Total completed and upcoming bookings"
            data={chartDataBookings}
            labels={months}
            color="#3b82f6"
          />
          <ChartCard 
            title="Monthly Revenue Stream" 
            subtitle="Simulated gross billing in USD"
            data={chartDataRevenue}
            labels={months}
            color="#ec4899"
          />
        </div>

        {/* Right side: Quick actions & Activity log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions Card */}
          <div className="discover-premium-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link 
                href="/venture/listings/new" 
                style={{
                  textDecoration: 'none',
                  padding: '12px',
                  background: 'var(--brand-gradient)',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textAlign: 'center',
                  boxShadow: '0 4px 10px rgba(236,72,153,0.2)'
                }}
                className="btn-shimmer-sweep"
              >
                Add Property Listing
              </Link>
              <Link 
                href="/venture/packages/new" 
                style={{
                  textDecoration: 'none',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              >
                Create Promotional Offer
              </Link>
              <Link 
                href="/venture/bookings" 
                style={{
                  textDecoration: 'none',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              >
                View Booking Calendar
              </Link>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="discover-premium-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Recent Activity</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    background: `${act.color}15`,
                    color: act.color,
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {act.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{act.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{act.desc}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
