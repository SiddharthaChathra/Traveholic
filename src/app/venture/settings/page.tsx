'use client';

import React, { useState } from 'react';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import ThreeTierButtonGroup from '@/components/shared/ThreeTierButtonGroup';

export default function VentureSettingsPage() {
  const [businessName, setBusinessName] = useState('Grand Plaza Resorts & Spa');
  const [taxId, setTaxId] = useState('VAT-98421098');
  const [phone, setPhone] = useState('+62 361 908122');
  
  // notifications toggle switches
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifySponsorships, setNotifySponsorships] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Venture settings saved successfully!');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Venture Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Configure business metadata, VAT details, and automated notification alerts.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Business details */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Business Information</h3>
          
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Venture Account Name</label>
            <input 
              type="text" 
              value={businessName} 
              onChange={(e) => setBusinessName(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>VAT / Tax Identification ID</label>
              <input 
                type="text" 
                value={taxId} 
                onChange={(e) => setTaxId(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Contact Phone</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Notification Settings</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Email Alerts for Bookings</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get notified immediately when a guest requests or completes a booking stay.</span>
            </div>
            <ToggleSwitch checked={notifyBookings} onChange={setNotifyBookings} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Email Alerts for Sponsorships</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get notified when travel vloggers apply for campaigns.</span>
            </div>
            <ToggleSwitch checked={notifySponsorships} onChange={setNotifySponsorships} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>In-app Message Alerts</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Receive notifications on guest inquiry replies.</span>
            </div>
            <ToggleSwitch checked={notifyMessages} onChange={setNotifyMessages} />
          </div>
        </div>

        <ThreeTierButtonGroup 
          buttons={[
            {
              label: 'Cancel Changes',
              onClick: () => {
                setBusinessName('Grand Plaza Resorts & Spa');
                setTaxId('VAT-98421098');
                setPhone('+62 361 908122');
              },
              variant: 'outline'
            },
            {
              label: 'Save Venture Policies',
              onClick: () => handleSave({ preventDefault: () => {} } as any),
              variant: 'primary'
            }
          ]}
        />
      </form>
    </div>
  );
}
