'use client';

import React, { useState } from 'react';
import Stepper from '@/components/shared/Stepper';
import PackageBuilder from '@/components/venture/PackageBuilder';
import ThreeTierButtonGroup from '@/components/shared/ThreeTierButtonGroup';
import { useRouter } from 'next/navigation';

export default function NewPackagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [packageData, setPackageData] = useState<any>(null);

  const steps = [
    { number: 1, label: 'Configure Bundle' },
    { number: 2, label: 'Review & Publish' }
  ];

  const handleSaveConfig = (data: any) => {
    setPackageData(data);
    setStep(2);
  };

  const handlePublish = () => {
    const saved = JSON.parse(localStorage.getItem('traveholic_created_packages') || '[]');
    const newPackage = {
      id: 'pack-' + Date.now(),
      name: packageData?.name || 'Custom Package',
      durationDays: packageData?.durationDays || 3,
      price: packageData?.price || 199,
      isFeatured: false,
      views: 0,
      bookingsCount: 0,
      conversionRate: 0,
      isGroupTrip: packageData?.isGroupTrip || false,
      minTravelers: packageData?.minTravelers || null,
      hostCommission: packageData?.hostCommission || null
    };
    saved.push(newPackage);
    localStorage.setItem('traveholic_created_packages', JSON.stringify(saved));

    alert('Package published successfully!');
    router.push('/venture/packages');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Build New Package</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Combine room stays, local shuttle transport, guides, and activity bookings into a single discounted package.</p>
      </div>

      <Stepper steps={steps} currentStep={step} onStepClick={setStep} />

      <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {step === 1 ? (
          <PackageBuilder onSave={handleSaveConfig} initialData={packageData} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Verify Bundle Package</h3>

            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BUNDLE TITLE</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>{packageData?.name}</span>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DESCRIPTION</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: '1.4' }}>{packageData?.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DURATION</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{packageData?.durationDays} Days</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BUNDLE PRICE</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>${packageData?.price}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>INCLUDED SERVICES</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {packageData?.inclusions?.stay && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Stay Included</span>}
                  {packageData?.inclusions?.tour && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Guided Tour</span>}
                  {packageData?.inclusions?.transport && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Transport Provided</span>}
                  {packageData?.inclusions?.guide && <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Personal Guide</span>}
                </div>
              </div>
            </div>

            <ThreeTierButtonGroup 
              buttons={[
                {
                  label: 'Cancel',
                  onClick: () => router.push('/venture/packages'),
                  variant: 'outline'
                },
                {
                  label: 'Back to Edit',
                  onClick: () => setStep(1),
                  variant: 'secondary'
                },
                {
                  label: 'Publish Bundle',
                  onClick: handlePublish,
                  variant: 'primary'
                }
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
