'use client';

import React, { useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: React.CSSProperties;
}

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  icon,
  trend,
  style
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    const duration = 1200; // ms
    const incrementTime = 16; // ~60fps
    const totalSteps = Math.ceil(duration / incrementTime);
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * end);
      
      if (step >= totalSteps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  const formattedValue = displayValue.toLocaleString();

  return (
    <div 
      className="discover-premium-card" 
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '120px',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            {prefix}{formattedValue}{suffix}
          </h3>
        </div>
        {icon && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            padding: '8px',
            color: 'var(--primary)'
          }}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', marginTop: '12px' }}>
          <span style={{ 
            color: trend.isPositive ? '#10b981' : '#f43f5e', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}
