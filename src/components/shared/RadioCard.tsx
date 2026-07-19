'use client';

import React from 'react';

interface RadioCardOption {
  value: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

interface RadioCardProps {
  options: RadioCardOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  columns?: number;
}

export default function RadioCard({ options, selectedValue, onChange, columns = 2 }: RadioCardProps) {
  return (
    <div 
      className="creator-choice-grid" 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${columns}, 1fr)`, 
        gap: '16px' 
      }}
    >
      {options.map((opt) => {
        const isActive = selectedValue === opt.value;
        return (
          <div
            key={opt.value}
            className={`creation-choice-card discover-premium-card ${isActive ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)' 
            }}>
              {opt.icon}
              <span style={{ fontWeight: 700, fontSize: '14px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{opt.description}</p>
          </div>
        );
      })}
    </div>
  );
}
