'use client';

import React, { useState } from 'react';
import Stepper from '@/components/shared/Stepper';
import RadioCard from '@/components/shared/RadioCard';
import TagPill from '@/components/shared/TagPill';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import ThreeTierButtonGroup from '@/components/shared/ThreeTierButtonGroup';
import { useRouter } from 'next/navigation';

export default function NewSponsorshipOfferPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // form states
  const [campaignName, setCampaignName] = useState('');
  const [budget, setBudget] = useState(1000);
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [targetAudience, setTargetAudience] = useState('global');

  // deliverables
  const [postsCount, setPostsCount] = useState(2);
  const [reelsCount, setReelsCount] = useState(2);
  const [vlogsCount, setVlogsCount] = useState(1);
  const [includesRightOfUse, setIncludesRightOfUse] = useState(true);

  const steps = [
    { number: 1, label: 'Campaign Info' },
    { number: 2, label: 'Deliverables' },
    { number: 3, label: 'Targeting & Audience' },
    { number: 4, label: 'Review & Send' }
  ];

  const handleSendOffer = () => {
    alert('Sponsorship offer template saved successfully!');
    router.push('/venture/sponsorships');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Create Sponsorship Offer</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Draft contract proposals, specify deliverable requirements, and define campaign budgets.</p>
      </div>

      <Stepper steps={steps} currentStep={step} onStepClick={setStep} />

      <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Campaign Details</h3>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Campaign Name</label>
              <input 
                type="text" 
                value={campaignName} 
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Bali Summer Luxury Showcase"
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Total Campaign Budget ($)</label>
                <input 
                  type="number" 
                  value={budget} 
                  onChange={(e) => setBudget(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Duration (Weeks)</label>
                <input 
                  type="number" 
                  value={durationWeeks} 
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Required Deliverables</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Instagram Posts</label>
                <input 
                  type="number" 
                  value={postsCount} 
                  onChange={(e) => setPostsCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Instagram Reels</label>
                <input 
                  type="number" 
                  value={reelsCount} 
                  onChange={(e) => setReelsCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>YouTube Vlogs</label>
                <input 
                  type="number" 
                  value={vlogsCount} 
                  onChange={(e) => setVlogsCount(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '10px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Right of Use (Paid Ads)</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Permit boosting travelers content in partner ads campaigns</span>
              </div>
              <ToggleSwitch checked={includesRightOfUse} onChange={setIncludesRightOfUse} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Target Audience Demographics</h3>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Geographic Niche Focus</label>
              <RadioCard 
                options={[
                  { value: 'global', label: 'Global Reach', description: 'Audience spread across multiple international zones' },
                  { value: 'regional', label: 'Regional Focus', description: 'Targeting specific continents or country groups' },
                  { value: 'local', label: 'Hyper Local', description: 'Focusing on residents of Bali or specific towns' }
                ]}
                selectedValue={targetAudience}
                onChange={setTargetAudience}
                columns={1}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Review Offer Template</h3>
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CAMPAIGN TITLE</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{campaignName || 'Bali Brand Campaign'}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BUDGET</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>${budget} for {durationWeeks} Weeks</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DELIVERABLES REQUIRED</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block' }}>
                  {postsCount} Posts, {reelsCount} Reels, {vlogsCount} YouTube Vlog.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action button bar */}
        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <ThreeTierButtonGroup 
            buttons={[
              {
                label: 'Cancel',
                onClick: () => router.push('/venture/sponsorships'),
                variant: 'outline'
              },
              {
                label: 'Back',
                onClick: () => setStep(step - 1),
                variant: 'secondary',
                disabled: step === 1
              },
              {
                label: step === 4 ? 'Save Offer Template' : 'Next Step',
                onClick: () => {
                  if (step === 4) {
                    handleSendOffer();
                  } else {
                    setStep(step + 1);
                  }
                },
                variant: 'primary'
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
