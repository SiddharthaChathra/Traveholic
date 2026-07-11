'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
      <motion.span 
        className={`slider round ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
        animate={{
          backgroundColor: checked ? 'var(--primary)' : 'var(--switch-bg, rgba(255,255,255,0.08))',
          boxShadow: checked ? '0 0 8px rgba(236,72,153,0.3)' : 'none'
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          cursor: disabled ? 'not-allowed' : 'pointer',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: '34px',
          border: '1px solid var(--switch-border, rgba(255,255,255,0.06))'
        }}
      >
        <motion.span 
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            height: '16px',
            width: '16px',
            left: checked ? '21px' : '2px',
            bottom: '2px',
            backgroundColor: 'white',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
          }} 
        />
      </motion.span>
    </label>
  );
}
