'use client';

import React, { useState } from 'react';
import ListingCard from '@/components/venture/ListingCard';
import TabBar from '@/components/shared/TabBar';
import Link from 'next/link';

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

export default function VentureListingsPage() {
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [listings, setListings] = useState<ListingItem[]>([
    {
      id: 'list-1',
      name: 'Grand Oceanfront Deluxe Suite',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
      status: 'active',
      priceMin: 220,
      priceMax: 350,
      rating: 4.9,
      reviewsCount: 142,
      location: 'Nusa Dua, Bali',
      category: 'Hotel Room'
    },
    {
      id: 'list-2',
      name: 'Forest Canopy Private Villa',
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80',
      status: 'active',
      priceMin: 450,
      priceMax: 780,
      rating: 4.8,
      reviewsCount: 89,
      location: 'Ubud, Bali',
      category: 'Villa'
    },
    {
      id: 'list-3',
      name: 'Tropical Garden Bungalow',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      status: 'inactive',
      priceMin: 120,
      priceMax: 180,
      rating: 4.6,
      reviewsCount: 54,
      location: 'Seminyak, Bali',
      category: 'Bungalow'
    },
    {
      id: 'list-4',
      name: 'Mountain Sunrise Wellness Cabana',
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      priceMin: 180,
      priceMax: 260,
      rating: 5.0,
      reviewsCount: 0,
      location: 'Kintamani, Bali',
      category: 'Cabana'
    }
  ]);

  const handleToggleStatus = (id: string, currentStatus: ListingItem['status']) => {
    const nextStatus: ListingItem['status'] = currentStatus === 'active' ? 'inactive' : 'active';
    setListings(listings.map(item => item.id === id ? { ...item, status: nextStatus } : item));
  };

  const filteredListings = listings.filter(item => {
    if (activeFilterTab === 'all') return true;
    return item.status === activeFilterTab;
  });

  const filterTabs = [
    { id: 'all', label: 'All Listings' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'pending', label: 'Pending Review' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Listings Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Configure properties, availability statuses, prices, and room packages.
          </p>
        </div>
        
        <Link 
          href="/venture/listings/new"
          style={{
            textDecoration: 'none',
            background: 'var(--brand-gradient)',
            color: 'white',
            fontWeight: 700,
            fontSize: '13px',
            padding: '12px 24px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="btn-shimmer-sweep"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Listing
        </Link>
      </div>

      {/* Tabs */}
      <TabBar 
        tabs={filterTabs} 
        activeTab={activeFilterTab} 
        onChangeTab={setActiveFilterTab} 
      />

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {filteredListings.map(item => (
          <ListingCard 
            key={item.id} 
            listing={item} 
            onToggleStatus={handleToggleStatus} 
          />
        ))}

        {filteredListings.length === 0 && (
          <div className="discover-premium-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No listings found matching this status filter.</span>
          </div>
        )}
      </div>
    </div>
  );
}
