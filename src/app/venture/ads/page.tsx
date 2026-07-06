'use client';

import React, { useState } from 'react';
import StatCard from '@/components/venture/StatCard';
import ChartCard from '@/components/shared/ChartCard';
import Stepper from '@/components/shared/Stepper';
import RadioCard from '@/components/shared/RadioCard';
import ThreeTierButtonGroup from '@/components/shared/ThreeTierButtonGroup';

export default function VentureAdsPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [budgetType, setBudgetType] = useState('daily');
  const [budgetVal, setBudgetVal] = useState(50);
  
  const steps = [
    { number: 1, label: 'Creative Setup' },
    { number: 2, label: 'Budget & Audience' },
    { number: 3, label: 'Confirm & Launch' }
  ];

  const handleLaunchCampaign = () => {
    alert('Ad campaign launched successfully!');
    setActiveStep(1);
    setCampaignName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Ads &amp; Promotions
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Boost listing visibility, schedule campaign budgets, and analyze conversion performance.
        </p>
      </div>

      {/* Ad performance mini-stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
        <StatCard title="CAMPAIGN IMPRESSIONS" value={45200} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} />
        <StatCard title="TOTAL AD CLICKS" value={1840} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 19 21 12 17 5 21 12 2" /></svg>} />
        <StatCard title="TOTAL CONVERSIONS" value={124} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>} />
        <StatCard title="AMOUNT SPENT ($)" value={850} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
      </div>

      {/* Campaign Grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Campaign Builder */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>Create Ad Campaign</h3>
          
          <Stepper steps={steps} currentStep={activeStep} onStepClick={setActiveStep} />

          <div style={{ marginTop: '24px' }}>
            {activeStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Campaign Name</label>
                  <input 
                    type="text" 
                    value={campaignName} 
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Summer Promo Boost"
                    style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Budget Setup</label>
                  <RadioCard 
                    options={[
                      { value: 'daily', label: 'Daily Budget', description: 'Spend a specific amount per day' },
                      { value: 'lifetime', label: 'Lifetime Budget', description: 'Cap overall spend across the campaign length' }
                    ]}
                    selectedValue={budgetType}
                    onChange={setBudgetType}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Budget Limit ($)</label>
                  <input 
                    type="number" 
                    value={budgetVal} 
                    onChange={(e) => setBudgetVal(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CAMPAIGN</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{campaignName || 'Unnamed campaign'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '12px' }}>BUDGET TYPE</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', textTransform: 'capitalize' }}>{budgetType} Limit: ${budgetVal}</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <ThreeTierButtonGroup 
                buttons={[
                  {
                    label: 'Reset',
                    onClick: () => { setCampaignName(''); setActiveStep(1); },
                    variant: 'outline'
                  },
                  {
                    label: 'Back',
                    onClick: () => setActiveStep(activeStep - 1),
                    variant: 'secondary',
                    disabled: activeStep === 1
                  },
                  {
                    label: activeStep === 3 ? 'Launch Campaign' : 'Next',
                    onClick: () => {
                      if (activeStep === 3) {
                        handleLaunchCampaign();
                      } else {
                        setActiveStep(activeStep + 1);
                      }
                    },
                    variant: 'primary'
                  }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Analytics mini-chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ChartCard 
            title="Daily Ad Impressions" 
            data={[1200, 1400, 1100, 1500, 1800, 2200, 2500, 2800, 2700, 3100]}
            labels={['1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d']}
            color="#fbbf24"
          />
          <ChartCard 
            title="CTR Conversion Trend" 
            data={[2.1, 2.5, 2.3, 2.8, 3.1, 3.5, 3.2, 3.8, 3.6, 4.2]}
            labels={['1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d']}
            color="#ec4899"
          />
        </div>
      </div>
    </div>
  );
}
