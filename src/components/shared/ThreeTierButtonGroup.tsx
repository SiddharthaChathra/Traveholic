'use client';

import React from 'react';

interface ButtonConfig {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

interface ThreeTierButtonGroupProps {
  buttons: ButtonConfig[];
  style?: React.CSSProperties;
}

export default function ThreeTierButtonGroup({ buttons, style }: ThreeTierButtonGroupProps) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', ...style }}>
      {buttons.map((btn, idx) => {
        const isPrimary = btn.variant === 'primary';
        const isSecondary = btn.variant === 'secondary';
        
        let buttonStyle: React.CSSProperties = {
          flex: 1,
          padding: '10px 18px',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '13px',
          cursor: btn.disabled ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          opacity: btn.disabled ? 0.5 : 1,
          border: 'none',
          outline: 'none'
        };

        if (isPrimary) {
          buttonStyle = {
            ...buttonStyle,
            background: 'var(--brand-gradient)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(236,72,153,0.25)'
          };
        } else if (isSecondary) {
          buttonStyle = {
            ...buttonStyle,
            background: 'var(--btn-secondary-bg, rgba(255, 255, 255, 0.06))',
            border: '1px solid var(--btn-secondary-border, rgba(255, 255, 255, 0.08))',
            color: 'var(--text-primary)'
          };
        } else {
          // outline
          buttonStyle = {
            ...buttonStyle,
            background: 'transparent',
            border: '1px solid var(--btn-outline-border, rgba(255, 255, 255, 0.15))',
            color: 'var(--text-secondary)'
          };
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={btn.onClick}
            disabled={btn.disabled}
            style={buttonStyle}
            className={isPrimary ? 'btn-shimmer-sweep' : ''}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}
