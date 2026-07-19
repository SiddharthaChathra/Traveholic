'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

export default function HiddenWordsPage() {
  const router = useRouter();

  // States
  const [hideComments, setHideComments] = useState(true);
  const [advancedFiltering, setAdvancedFiltering] = useState(false);
  const [hideMessageRequests, setHideMessageRequests] = useState(false);
  
  // Custom words states
  const [customHideComments, setCustomHideComments] = useState(false);
  const [customHideMessages, setCustomHideMessages] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [customWords, setCustomWords] = useState<string[]>(['spam', 'scam', 'free followers']);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWord.trim().toLowerCase();
    if (trimmed && !customWords.includes(trimmed)) {
      setCustomWords([...customWords, trimmed]);
      setNewWord('');
    }
  };

  const handleRemoveWord = (word: string) => {
    setCustomWords(customWords.filter(w => w !== word));
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Hidden Words</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Filter out offensive words, custom phrases, and spam messages</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Unwanted comments & message requests */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Unwanted comments & message requests</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Hide comments</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '500px', display: 'block' }}>Comments that contain potentially offensive, misleading, or spam words will be automatically hidden. You can unhide comments at any time.</span>
              </div>
              <ToggleSwitch checked={hideComments} onChange={setHideComments} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Advanced comment filtering</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '500px', display: 'block' }}>Turn on advanced content matching to filter even more comment spam.</span>
              </div>
              <ToggleSwitch checked={advancedFiltering} onChange={setAdvancedFiltering} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Hide message requests</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '500px', display: 'block' }}>Message requests that contain spam, scams, or offensive phrases will be hidden in a separate requests folder.</span>
              </div>
              <ToggleSwitch checked={hideMessageRequests} onChange={setHideMessageRequests} />
            </div>
          </div>
        </div>

        {/* Custom words and phrases */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Custom words for messages & comments</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Hide comments with custom words</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Comments that contain custom list words or phrases will be filtered out.</span>
              </div>
              <ToggleSwitch checked={customHideComments} onChange={setCustomHideComments} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Hide messages with custom words</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Messages containing custom list words will be filtered directly.</span>
              </div>
              <ToggleSwitch checked={customHideMessages} onChange={setCustomHideMessages} />
            </div>

            {/* Custom Words Sub-Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Manage custom words & phrases</span>
              
              <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Add custom word (e.g. promo)..."
                  style={{ flex: 1, padding: '10px 14px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  Add
                </button>
              </form>

              {/* Display list of words */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {customWords.map(word => (
                  <span 
                    key={word}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {word}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveWord(word)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                    >
                      &times;
                    </button>
                  </span>
                ))}

                {customWords.length === 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No custom words added yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => {
              alert('Hidden words rules saved successfully!');
              router.push('/settings');
            }} 
            className="btn-primary" 
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
          >
            Save Filtering Rules
          </button>
        </div>

      </div>
    </div>
  );
}
