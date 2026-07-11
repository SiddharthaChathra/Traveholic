'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpSupportPage() {
  const router = useRouter();

  // State
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const supportLinks = [
    { title: 'Help Center', desc: 'Browse user guides, maps setups, and account FAQs' },
    { title: 'Scam Protection Center', desc: 'Report suspicious listings, fraudulent payments, and fake profiles' },
    { title: 'Privacy and Security Help', desc: 'Learn how to secure your traveler journal' },
    { title: 'Support Requests', desc: 'View status logs of your active and past support tickets' }
  ];

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating');
      return;
    }
    setFeedbackSubmitted(true);
    alert('Thank you for your feedback! It helps us improve Travora.');
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Help & Support</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Get help, report scams, and provide platform feedback</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Support sub-list links */}
        <div 
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {supportLinks.map((link, idx) => (
            <div 
              key={link.title}
              onClick={() => alert(`Opening help section: ${link.title}...`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: idx < supportLinks.length - 1 ? '1px solid var(--card-border)' : 'none',
                transition: 'background 0.2s ease'
              }}
              className="settings-list-item-hover"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{link.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{link.desc}</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback form */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tell us how we're doing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>How satisfied are you with the help and support resources on Travora?</p>
          </div>

          {!feedbackSubmitted ? (
            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
              
              {/* Rating selector buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Rating</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: rating === val ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                        background: rating === val ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text feedback */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Details (Optional)</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share details on how we can improve support..."
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
                  Submit Feedback
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              borderTop: '1px solid var(--card-border)',
              paddingTop: '20px'
            }}>
              Feedback submitted successfully. Thank you!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
