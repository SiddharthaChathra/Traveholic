'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Stepper from '@/components/shared/Stepper';
import UploadMedia from '@/components/shared/UploadMedia';

export default function VerifiedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || 'Shashank Suvarna');
  const [category, setCategory] = useState('vlogger');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const steps = [
    { number: 1, label: 'Confirm Info' },
    { number: 2, label: 'Upload ID' },
    { number: 3, label: 'Guidelines' }
  ];

  const handleUpload = (files: File[]) => {
    setUploadedFiles(files);
    alert(`${files.length} document file(s) uploaded successfully.`);
  };

  const handleNext = () => {
    if (step === 1 && !fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (step === 2 && uploadedFiles.length === 0) {
      alert('Please upload an identification document');
      return;
    }
    if (step === 3 && !agreeTerms) {
      alert('Please agree to the traveler guidelines');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      alert('Your verification application has been submitted successfully! We will review it in 2-3 business days.');
      router.push('/settings');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/settings');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={handleBack}
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Apply for Verification</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Apply for the official Travora badge to confirm your profile authenticity</p>
        </div>
      </div>

      {/* Stepper display */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '20px 24px' }}>
        <Stepper steps={steps} currentStep={step} onStepClick={setStep} />
      </div>

      {/* Step Panels */}
      <div style={{ minHeight: '300px' }}>
        {step === 1 && (
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Step 1: Confirm Profile Details</h3>
            
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Account Username</label>
              <input 
                type="text" 
                value={user?.username || 'shashank._s'} 
                disabled
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '13px', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Legal Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your legal name as on ID..."
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Verification Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
              >
                <option value="vlogger">Travel Vlogger / Content Creator</option>
                <option value="explorer">Solo Explorer / Adventurer</option>
                <option value="business">Venture Hotel / Agency</option>
                <option value="journalist">Travel Journalist / Writer</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Step 2: Upload Legal Identification</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Upload a photo or scanned copy of a valid government-issued photo ID (e.g. Passport, Drivers License, or official business license) to verify legal identity.</p>
            
            <UploadMedia 
              onUpload={handleUpload} 
              title="Click or drag passport/license photo here" 
              subtitle="JPG, PNG, or PDF file (max 5MB)"
              accept="image/*,application/pdf"
              multiple={false}
              style={{
                border: '2px dashed var(--input-border)',
                borderRadius: '12px',
                padding: '40px',
                background: 'rgba(255,255,255,0.01)',
                textAlign: 'center'
              }}
            />

            {uploadedFiles.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>
                <span>&bull;</span>
                <span>{uploadedFiles[0].name} ({Math.round(uploadedFiles[0].size / 1024)} KB)</span>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Step 3: Guidelines & Agreements</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.15)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Travora Community Verification Terms:</span>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>1. Authenticity: Your profile must represent a real person, registered brand, or entity.</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>2. Respectful Travel: Verified explorers must follow community rules, promoting eco-friendly, legal, and culturally respectful tourism practices.</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>3. Transparency: Any paid sponsorships or promotional stays must be declared explicitly on travel logs.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <input 
                type="checkbox" 
                id="agree" 
                checked={agreeTerms} 
                onChange={(e) => setAgreeTerms(e.target.checked)} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="agree" style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                I agree to the Travora community verification terms and guidelines
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Buttons Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'var(--btn-secondary-bg)',
            border: '1px solid var(--btn-secondary-border)',
            color: 'var(--text-primary)',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
          className="btn-primary"
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {step === 3 ? 'Submit Application' : 'Next Step'}
        </button>
      </div>
    </div>
  );
}
