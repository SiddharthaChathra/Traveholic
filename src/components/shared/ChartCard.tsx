'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sanitize title to use as a valid SVG gradient/filter ID
  const cleanId = title.replace(/[^a-zA-Z0-9]/g, '');

  const maxVal = Math.max(...data, 10);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal;
  
  const width = 500;
  const svgHeight = 120;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = svgHeight - 15 - ((val - minVal) / range) * (svgHeight - 30);
    return { x, y };
  });

  // Smooth bezier curve generator
  const getBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
    }
    return d;
  };

  // Split points into past/present (index 0-8) and future projected (index 8-11)
  const pastPoints = points.slice(0, 9);
  const futurePoints = points.slice(8);

  const fullPathD = getBezierPath(points);
  const fillPathD = fullPathD + ` L ${width.toFixed(1)},${svgHeight} L 0,${svgHeight} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * width;
    const nearestIdx = Math.round((clickX / width) * (data.length - 1));
    if (nearestIdx >= 0 && nearestIdx < data.length) {
      setHoveredIdx(nearestIdx);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <motion.div 
      ref={containerRef}
      whileHover={{ 
        y: -4, 
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${color}10`,
        borderColor: `${color}40`
      }}
      className="discover-premium-card" 
      style={{ 
        padding: '20px', 
        borderRadius: '16px', 
        background: 'var(--card-bg)', 
        border: '1px solid var(--card-border)',
        position: 'relative',
        transition: 'border-color 0.3s ease',
        ...style 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{title}</h4>
          {subtitle && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        
        {/* Trend badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '20px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#34d399'
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          {title.includes('Revenue') ? '+14.8%' : '+12.5%'}
        </div>
      </div>
      
      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
        <svg 
          viewBox={`0 0 ${width} ${svgHeight}`} 
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: '100%', height: '100%', overflow: 'visible', cursor: 'crosshair' }}
        >
          <defs>
            {/* Glowing neon filter */}
            <filter id={`glow-${cleanId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Gradient fill */}
            <linearGradient id={`chartGrad-${cleanId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[20, 50, 80, 110].map((yVal, i) => (
            <line key={i} x1="0" y1={yVal} x2={width} y2={yVal} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
          ))}
          {points.map((p, idx) => (
            <line key={idx} x1={p.x} y1="0" x2={p.x} y2={svgHeight} stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
          ))}
          
          {/* Fill Area (fades in after line animation finishes) */}
          {points.length > 0 && (
            <motion.path 
              d={fillPathD} 
              fill={`url(#chartGrad-${cleanId})`} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            />
          )}

          {/* Vertical Hover snap guide line */}
          {hoveredIdx !== null && (
            <line 
              x1={points[hoveredIdx].x} 
              y1="0" 
              x2={points[hoveredIdx].x} 
              y2={svgHeight} 
              stroke={`${color}50`} 
              strokeWidth="1.5" 
              strokeDasharray="2 2"
            />
          )}

          {/* Solid line (Past/Present data) */}
          {pastPoints.length > 0 && (
            <motion.path 
              d={getBezierPath(pastPoints)} 
              fill="none" 
              stroke={color} 
              strokeWidth="3" 
              strokeLinecap="round" 
              filter={`url(#glow-${cleanId})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
            />
          )}

          {/* Dashed line (Projected data) */}
          {futurePoints.length > 0 && (
            <motion.path 
              d={getBezierPath(futurePoints)} 
              fill="none" 
              stroke={color} 
              strokeWidth="3" 
              strokeDasharray="5 5"
              strokeLinecap="round" 
              opacity="0.75"
              filter={`url(#glow-${cleanId})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Glowing markers visible on hover */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx}>
                {isHovered && (
                  <>
                    <circle cx={p.x} cy={p.y} r="8" fill={color} opacity="0.3" filter={`url(#glow-${cleanId})`} />
                    <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2.5" />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip card */}
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${(points[hoveredIdx].x / width) * 100}%`,
                top: `${(points[hoveredIdx].y / svgHeight) * 100 - 15}%`,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                zIndex: 20,
                background: 'rgba(15, 23, 42, 0.95)',
                border: `1px solid ${color}40`,
                borderRadius: '10px',
                padding: '8px 12px',
                boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px ${color}20`,
                backdropFilter: 'blur(8px)',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{labels ? labels[hoveredIdx] : ''}</span>
                {hoveredIdx >= 8 && (
                  <span style={{ 
                    fontSize: '8px', 
                    background: 'rgba(245, 158, 11, 0.15)', 
                    color: '#fbbf24', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontWeight: 800 
                  }}>
                    PROJECTED
                  </span>
                )}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {title.includes('Revenue') ? `$${data[hoveredIdx].toLocaleString()}` : `${data[hoveredIdx]} bookings`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {labels && labels.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          {labels.map((lbl, idx) => {
            const isCurrentMonth = lbl === 'Sep';
            return (
              <span 
                key={idx} 
                style={{ 
                  fontSize: '10px', 
                  fontWeight: isCurrentMonth ? 800 : 500,
                  color: isCurrentMonth ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                {lbl}
              </span>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
