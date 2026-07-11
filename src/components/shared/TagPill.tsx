'use client';

import React from 'react';

interface TagPillProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function TagPill({ label, isActive = false, onClick, icon, style }: TagPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '20px',
        border: isActive ? '1px solid transparent' : '1px solid var(--tag-border, rgba(255, 255, 255, 0.08))',
        background: isActive ? 'var(--brand-gradient)' : 'var(--tag-bg, rgba(255, 255, 255, 0.02))',
        color: isActive ? '#ffffff' : 'var(--tag-color, rgba(255, 255, 255, 0.7))',
        fontSize: '12px',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
