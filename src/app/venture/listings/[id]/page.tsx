'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ListingItem {
  id: string;
  name: string;
  image: string;
  images: string[];
  price: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewsCount: number;
  location: string;
  category: string;
  description: string;
  amenities: string[];
}

export default function PublicListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const listingsDatabase: Record<string, ListingItem> = {
    'list-1': {
      id: 'list-1',
      name: 'Grand Oceanfront Deluxe Suite',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80'
      ],
      price: '$220 - $350 / night',
      priceMin: 220,
      priceMax: 350,
      rating: 4.9,
      reviewsCount: 142,
      location: 'Nusa Dua, Bali',
      category: 'Hotel Room',
      description: 'Experience absolute seaside luxury in our Oceanfront Deluxe Suite. Wake up to direct panoramic views of the turquoise Indian Ocean, feel the cool tropical breeze on your spacious private balcony, and enjoy state-of-the-art room amenities. Ideal for couples seeking a romantic premium beach getaway.',
      amenities: ['Ocean View balcony', 'Infinity Pool access', 'Free High-speed Wi-Fi', '24/7 Butler service', 'Luxury spa access', 'Complimentary breakfast buffet', 'Mini-bar & espresso machine']
    },
    'list-2': {
      id: 'list-2',
      name: 'Forest Canopy Private Villa',
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80'
      ],
      price: '$450 - $780 / night',
      priceMin: 450,
      priceMax: 780,
      rating: 4.8,
      reviewsCount: 89,
      location: 'Ubud, Bali',
      category: 'Villa',
      description: 'Tucked away in the serene jungle canopy of Ubud, this luxury multi-story villa offers unparalleled privacy and closeness to nature. Features a stunning private glass-bottom infinity pool overlooking the valley river, gorgeous indoor-outdoor living spaces, and bespoke wood craftsmanship. A true jungle sanctuary.',
      amenities: ['Private infinity pool', 'Valley & river views', 'Outdoor rain shower', 'Personal chef service', 'Free High-speed Wi-Fi', 'Yoga deck & mats', 'Airport transfer included']
    },
    'list-3': {
      id: 'list-3',
      name: 'Tropical Garden Bungalow',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format&fit=crop&q=80'
      ],
      price: '$120 - $180 / night',
      priceMin: 120,
      priceMax: 180,
      rating: 4.6,
      reviewsCount: 54,
      location: 'Seminyak, Bali',
      category: 'Bungalow',
      description: 'A charming, authentic Balinese bungalow surrounded by lush, vibrant tropical gardens. Located just a short stroll from Seminyak\'s famous white-sand beaches, boutique shops, and world-class restaurants. Offers a quiet, peaceful oasis with a shared lagoon pool and cozy outdoor daybeds.',
      amenities: ['Lush garden views', 'Lagoon pool access', 'A/C & ceiling fan', 'Cozy outdoor daybed', 'Free Wi-Fi', 'Daily housekeeping', 'Walk to Seminyak beach']
    },
    'list-4': {
      id: 'list-4',
      name: 'Aurora Glass Cabin',
      image: 'https://images.unsplash.com/photo-1518602164578-cd007474d88e?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1518602164578-cd007474d88e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=1200&auto=format&fit=crop&q=80'
      ],
      price: '$290 - $480 / night',
      priceMin: 290,
      priceMax: 480,
      rating: 4.95,
      reviewsCount: 104,
      location: 'Reykjavik, Iceland',
      category: 'Cabin',
      description: 'Sleep under the spectacular dancing Northern Lights in this architectural glass cabin. Designed with triple-glazed glass walls and ceiling, you will get a 360-degree view of the Icelandic night sky and dramatic volcanic plains while staying warm and cozy inside. Features an outdoor geothermally heated hot tub.',
      amenities: ['360 Glass walls & ceiling', 'Outdoor geothermally heated hot tub', 'Fully equipped kitchen', 'Cozy fireplace', 'Free High-speed Wi-Fi', 'Premium sound system', 'Telescope for stargazing']
    },
    'list-5': {
      id: 'list-5',
      name: 'Manali Alpine Retreat',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=1200&auto=format&fit=crop&q=80'
      ],
      price: '$80 - $150 / night',
      priceMin: 80,
      priceMax: 150,
      rating: 4.7,
      reviewsCount: 76,
      location: 'Manali, Himachal Pradesh',
      category: 'Cottage',
      description: 'A cozy timber-and-stone alpine retreat offering gorgeous snow-capped mountain views of the Himalayas. Sit by the burning stone fireplace with a warm cup of local tea, or hike directly into the surrounding pine forests. A perfect home base for mountain trekking and adventure seekers.',
      amenities: ['Snow-capped Mountain views', 'Indoor stone fireplace', 'Private balcony', 'Free Wi-Fi', 'Local herbal teas', 'Trekking gear rental', 'Bonfire pit access']
    }
  };

  const listing = listingsDatabase[id] || listingsDatabase['list-1'];
  const listingImages = listing.images || [listing.image];

  // Booking details state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [isBooked, setIsBooked] = useState(false);

  // Gallery & Parallax state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    setIsBooked(true);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #131524 0%, #090a12 100%)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      paddingBottom: '80px',
    }}>
      {/* Dynamic navbar header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 10, 18, 0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => router.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Venture Offer
            </span>
            <h1 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0', fontFamily: 'var(--font-title)' }}>
              {listing.name}
            </h1>
          </div>
        </div>
        
        <Link 
          href="/" 
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#ec4899',
            textDecoration: 'none',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'rgba(236, 72, 153, 0.05)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(236, 72, 153, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.25)';
          }}
        >
          Back to Feed
        </Link>
      </header>

      {/* Main hero banner */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsLightboxOpen(true)}
        style={{
          position: 'relative',
          height: '460px',
          width: '100%',
          overflow: 'hidden',
          perspective: '1000px',
          cursor: 'zoom-in',
        }}
      >
        {/* Parallax Image Layer */}
        <motion.div
          animate={{
            scale: isHovered ? 1.07 : 1.02,
            x: coords.x * -18,
            y: coords.y * -18,
            rotateX: coords.y * -5,
            rotateY: coords.x * 5,
          }}
          transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.6 }}
          style={{
            position: 'absolute',
            inset: -10,
            width: 'calc(100% + 20px)',
            height: 'calc(100% + 20px)',
            backgroundImage: `url(${listingImages[activeImageIdx]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transformOrigin: 'center center',
          }}
        />

        {/* Cinematic Linear Gradient Scrim */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(9, 10, 18, 0.15) 0%, rgba(9, 10, 18, 0.35) 45%, rgba(9, 10, 18, 0.96) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Glassmorphic Carousel Switcher Thumbnails */}
        <div 
          onClick={(e) => e.stopPropagation()} // Stop clicking switcher from opening lightbox
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            zIndex: 15,
            display: 'flex',
            gap: '8px',
            background: 'rgba(15, 17, 28, 0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '6px 10px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {listingImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveImageIdx(idx);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: activeImageIdx === idx ? '2px solid #ec4899' : '2px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeImageIdx === idx ? 'scale(1.15)' : 'scale(1)',
                boxShadow: activeImageIdx === idx ? '0 0 12px rgba(236, 72, 153, 0.5)' : 'none',
              }}
              title={`View slide ${idx + 1}`}
            />
          ))}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          zIndex: 3
        }}>
          <div>
            <span style={{ 
              background: 'rgba(236, 72, 153, 0.15)', 
              color: '#f472b6', 
              fontSize: '11px', 
              fontWeight: 800, 
              padding: '4px 12px', 
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {listing.category}
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '12px', color: '#ffffff', fontFamily: 'var(--font-title)', textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
              {listing.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{listing.rating}</span>
                <span>({listing.reviewsCount} reviews)</span>
              </div>
              <span>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{listing.location}</span>
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 24px',
            borderRadius: '16px',
            textAlign: 'right'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Starting From</span>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#ec4899', fontFamily: 'var(--font-title)' }}>
              ${listing.priceMin}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}> / night</span>
          </div>
        </div>
      </div>

      {/* Grid details pane */}
      <div style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '40px',
      }}>
        {/* Left column info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              About this Space
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '14.5px' }}>
              {listing.description}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              Amenities Offered
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {listing.amenities.map((amenity, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              Host Guidelines & Rules
            </h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.6 }}>
              <li><strong>Check-in:</strong> Flexible check-in after 2:00 PM</li>
              <li><strong>Check-out:</strong> Prior to 11:00 AM local time</li>
              <li><strong>Cancellation Policy:</strong> Free cancellations up to 48 hours before check-in. Non-refundable thereafter.</li>
              <li>No loud music or parties after 10:00 PM in consideration of local nature and nearby guests.</li>
              <li>We request guests to follow local eco-friendly trash disposal rules.</li>
            </ul>
          </div>
        </div>

        {/* Right column checkout card */}
        <div>
          <div style={{
            background: 'rgba(15, 17, 28, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            position: 'sticky',
            top: '100px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Reserve Listing</span>
              <span style={{ fontSize: '11px', color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                Instant Booking
              </span>
            </h4>
            
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Check In</label>
                <input 
                  type="date" 
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Check Out</label>
                <input 
                  type="date" 
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Total Guests</label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                >
                  <option value={1} style={{ background: '#111827' }}>1 Guest</option>
                  <option value={2} style={{ background: '#111827' }}>2 Guests</option>
                  <option value={3} style={{ background: '#111827' }}>3 Guests</option>
                  <option value={4} style={{ background: '#111827' }}>4 Guests</option>
                </select>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px dashed rgba(255,255,255,0.05)',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Price Est. ({guests} guests)</span>
                <span style={{ fontWeight: 700, color: '#ec4899' }}>${listing.priceMin} - ${listing.priceMax} / night</span>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Request Reservation
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal Drawer Overlay */}
      <AnimatePresence>
        {isBooked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => setIsBooked(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: '90%',
                maxWidth: '400px',
                background: '#131524',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 20px'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-title)' }}>
                Reservation Requested!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                Your booking request for <strong>{listing.name}</strong> from {checkIn} to {checkOut} has been registered successfully. The host will review and contact you shortly.
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsBooked(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => router.push('/')}
                  style={{
                    flex: 1.5,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Back to Homepage
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 6, 12, 0.95)',
              backdropFilter: 'blur(24px)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
                fontSize: '24px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              &times;
            </button>

            {/* Navigation buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx(prev => (prev - 1 + listingImages.length) % listingImages.length);
              }}
              style={{
                position: 'absolute',
                left: '24px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
                fontSize: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              &#10094;
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIdx(prev => (prev + 1) % listingImages.length);
              }}
              style={{
                position: 'absolute',
                right: '24px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
                fontSize: '20px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              &#10095;
            </button>

            {/* Main Lightbox Image */}
            <motion.img
              key={activeImageIdx}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={listingImages[activeImageIdx]}
              alt={listing.name}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '85vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            />

            {/* Title / Info Bar */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'white' }}>{listing.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                {listing.location} &bull; Image {activeImageIdx + 1} of {listingImages.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
