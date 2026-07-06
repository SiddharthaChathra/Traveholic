'use client';

import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <label className="switch" style={{ display: 'inline-block', position: 'relative', width: '40px', height: '22px', userSelect: 'none' }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        disabled={disabled}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span className={`slider round ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} style={{
        position: 'absolute',
        cursor: disabled ? 'not-allowed' : 'pointer',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: checked ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
        transition: '0.3s',
        borderRadius: '34px',
        boxShadow: checked ? '0 0 8px rgba(236,72,153,0.3)' : 'none',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <span style={{
          position: 'absolute',
          content: '""',
          height: '16px',
          width: '16px',
          left: checked ? '21px' : '2px',
          bottom: '2px',
          backgroundColor: 'white',
          transition: '0.3s',
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
        }} />
      </span>
    </label>
  );
}
