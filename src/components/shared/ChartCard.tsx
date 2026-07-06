'use client';

import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: number[];
  labels?: string[];
  height?: number;
  color?: string; // hex or var
  style?: React.CSSProperties;
}

export default function ChartCard({
  title,
  subtitle,
  data,
  labels,
  height = 140,
  color = '#ec4899',
  style
}: ChartCardProps) {
  // calculate points for path
  const maxVal = Math.max(...data, 10);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal;
  
  const width = 400;
  const svgHeight = 120;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    // invert Y since 0 is top in SVG
    const y = svgHeight - 10 - ((val - minVal) / range) * (svgHeight - 20);
    return { x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)} `;
  }, '');

  const areaD = pathD + `L ${width},${svgHeight} L 0,${svgHeight} Z`;

  return (
    <div 
      className="discover-premium-card" 
      style={{ 
        padding: '20px', 
        borderRadius: '16px', 
        background: 'var(--card-bg)', 
        border: '1px solid var(--card-border)',
        ...style 
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{title}</h4>
        {subtitle && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      
      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${svgHeight}`} style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id={`chartGrad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="30" x2={width} y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="0" y1="60" x2={width} y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="0" y1="90" x2={width} y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          
          {/* Fill Area */}
          {points.length > 0 && (
            <path 
              d={areaD} 
              fill={`url(#chartGrad-${title.replace(/\s+/g, '')})`} 
            />
          )}
          {/* Line */}
          {points.length > 0 && (
            <path 
              d={pathD} 
              fill="none" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
          )}
        </svg>
      </div>

      {labels && labels.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          {labels.map((lbl, idx) => (
            <span key={idx} style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{lbl}</span>
          ))}
        </div>
      )}
    </div>
  );
}
