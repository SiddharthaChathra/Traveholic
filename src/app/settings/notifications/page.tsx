'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // States - Push Notifications
  const [pushFollowers, setPushFollowers] = useState(true);
  const [pushLikesComments, setPushLikesComments] = useState(true);
  const [pushSponsorships, setPushSponsorships] = useState(true);
  const [pushBookings, setPushBookings] = useState(true);
  const [pushStreams, setPushStreams] = useState(false);

  // States - Email Notifications
  const [emailFollowers, setEmailFollowers] = useState(false);
  const [emailLikesComments, setEmailLikesComments] = useState(false);
  const [emailSponsorships, setEmailSponsorships] = useState(true);
  const [emailBookings, setEmailBookings] = useState(true);
  const [emailStreams, setEmailStreams] = useState(true);

  const handleSave = () => {
    alert('Notification preferences updated!');
    router.push('/settings');
  };

  const isBusiness = user?.role === 'business';

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Notifications</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Choose which alerts you receive via push and email</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Push Notifications Section */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Push Notifications</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--card-border)', paddingTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>New Followers</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get notified immediately when another explorer starts following you.</span>
              </div>
              <ToggleSwitch checked={pushFollowers} onChange={setPushFollowers} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Likes & Comments</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Alerts for interactions on your travel posts, stories, and routes.</span>
              </div>
              <ToggleSwitch checked={pushLikesComments} onChange={setPushLikesComments} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Sponsorship Offers</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get notified when travel ventures apply or send brand contract pitches.</span>
              </div>
              <ToggleSwitch checked={pushSponsorships} onChange={setPushSponsorships} />
            </div>

            {isBusiness && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Booking Updates</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Alerts for check-ins, packages purchased, and reservation requests.</span>
                </div>
                <ToggleSwitch checked={pushBookings} onChange={setPushBookings} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Live-stream Broadcasts</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Alerts when vloggers in your Inner Circle start streaming live.</span>
              </div>
              <ToggleSwitch checked={pushStreams} onChange={setPushStreams} />
            </div>
          </div>
        </div>

        {/* Email Notifications Section */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Email Summaries</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--card-border)', paddingTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Weekly Followers Summary</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Receive email notifications summarizing your new follower acquisitions.</span>
              </div>
              <ToggleSwitch checked={emailFollowers} onChange={setEmailFollowers} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Comments & Feedback Digest</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email digests listing comments and question replies on your guides.</span>
              </div>
              <ToggleSwitch checked={emailLikesComments} onChange={setEmailLikesComments} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Sponsorship Documents & Alerts</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email contract agreements and campaign invitations directly to inbox.</span>
              </div>
              <ToggleSwitch checked={emailSponsorships} onChange={setEmailSponsorships} />
            </div>

            {isBusiness && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Customer Booking Receipts</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Receive email invoices and booking schedules for hotel check-ins.</span>
                </div>
                <ToggleSwitch checked={emailBookings} onChange={setEmailBookings} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Important live-broadcast summaries</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Weekly recap email of streams from creators you support.</span>
              </div>
              <ToggleSwitch checked={emailStreams} onChange={setEmailStreams} />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={handleSave} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
