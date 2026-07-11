import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ListingItem {
  id: string;
  name: string;
  image: string;
  status: 'active' | 'inactive' | 'pending';
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewsCount: number;
  location: string;
  category: string;
}

interface ListingCardProps {
  listing: ListingItem;
  onToggleStatus?: (id: string, currentStatus: ListingItem['status']) => void;
  style?: React.CSSProperties;
}

export default function ListingCard({ listing, onToggleStatus, style }: ListingCardProps) {
  const getStatusBadge = (status: ListingItem['status']) => {
    let bg = 'rgba(16, 185, 129, 0.15)';
    let color = '#34d399';
    let label = 'Active';

    if (status === 'inactive') {
      bg = 'rgba(148, 163, 184, 0.15)';
      color = '#94a3b8';
      label = 'Inactive';
    } else if (status === 'pending') {
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      label = 'Pending Review';
    }

    return (
      <span style={{
        background: bg,
        color: color,
        fontSize: '11px',
        fontWeight: 700,
        padding: '4px 8px',
        borderRadius: '20px',
        border: `1px solid ${color}30`
      }}>
        {label}
      </span>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.015, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)' }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25 }}
      className="discover-premium-card" 
      style={{
        borderRadius: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...style
      }}
    >
      <div style={{ position: 'relative', height: '180px', width: '100%' }}>
        <img 
          src={listing.image} 
          alt={listing.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5 }}>
          {getStatusBadge(listing.status)}
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {listing.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{listing.rating.toFixed(1)}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({listing.reviewsCount})</span>
            </div>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>{listing.name}</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {listing.location}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.06))', paddingTop: '16px', marginTop: '8px' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>PRICE RANGE</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${listing.priceMin} - ${listing.priceMax}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}> / night</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.div
                whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex' }}
              >
                <Link 
                  href={`/venture/listings/${listing.id}/edit`}
                  style={{
                    background: 'var(--glass-bg-subtle, rgba(255,255,255,0.04))',
                    border: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.08))',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </Link>
              </motion.div>
              {onToggleStatus && (
                <motion.button
                  whileHover={{ scale: 1.05, background: 'var(--glass-bg-subtle, rgba(255,255,255,0.08))' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleStatus(listing.id, listing.status)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border-medium, rgba(255,255,255,0.12))',
                    padding: '6px',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  title={listing.status === 'active' ? 'Deactivate Listing' : 'Activate Listing'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
