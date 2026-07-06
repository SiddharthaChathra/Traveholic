'use client';

import React, { useState } from 'react';
import BookingCalendar from '@/components/venture/BookingCalendar';
import TabBar from '@/components/shared/TabBar';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import ThreeTierButtonGroup from '@/components/shared/ThreeTierButtonGroup';

interface BookingItem {
  id: string;
  guestName: string;
  guestEmail: string;
  listingName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'pending';
  pricePaid: number;
  specialRequests?: string;
  checkedIn?: boolean;
}

export default function VentureBookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: 'book-1',
      guestName: 'Emma Watson',
      guestEmail: 'emma@watson.com',
      listingName: 'Grand Oceanfront Deluxe Suite',
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      status: 'upcoming',
      pricePaid: 750,
      specialRequests: 'Prefers high floor if available. Late check-in around 10pm.',
      checkedIn: false
    },
    {
      id: 'book-2',
      guestName: 'Johnathan Doe',
      guestEmail: 'john@doe.com',
      listingName: 'Forest Canopy Private Villa',
      checkIn: '2026-07-05',
      checkOut: '2026-07-09',
      status: 'ongoing',
      pricePaid: 1800,
      specialRequests: 'Allergic to peanuts.',
      checkedIn: true
    },
    {
      id: 'book-3',
      guestName: 'Sarah Jenkins',
      guestEmail: 'sarah@jenkins.com',
      listingName: 'Tropical Garden Bungalow',
      checkIn: '2026-06-25',
      checkOut: '2026-06-28',
      status: 'completed',
      pricePaid: 360,
      checkedIn: false
    },
    {
      id: 'book-4',
      guestName: 'Michael Brown',
      guestEmail: 'michael@brown.com',
      listingName: 'Grand Oceanfront Deluxe Suite',
      checkIn: '2026-07-20',
      checkOut: '2026-07-24',
      status: 'pending',
      pricePaid: 1000,
      specialRequests: 'Needs extra cot for child.'
    }
  ]);

  const handleUpdateStatus = (id: string, nextStatus: BookingItem['status']) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: nextStatus } : b));
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: nextStatus });
    }
  };

  const handleToggleCheckin = (id: string, currentVal: boolean) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, checkedIn: !currentVal } : b));
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, checkedIn: !currentVal });
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'pending', label: 'Pending Approval' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Bookings &amp; Reservations
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Manage active guests, coordinate room check-ins, and approve pending stays.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px' }}>
          <button 
            onClick={() => setViewMode('calendar')}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: 'none', background: viewMode === 'calendar' ? 'rgba(255,255,255,0.06)' : 'transparent', color: viewMode === 'calendar' ? 'white' : 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}
          >
            Calendar
          </button>
          <button 
            onClick={() => setViewMode('list')}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, border: 'none', background: viewMode === 'list' ? 'rgba(255,255,255,0.06)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}
          >
            List Table
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <BookingCalendar 
          bookings={bookings} 
          onSelectDate={(dateStr) => {
            const booking = bookings.find(b => b.checkIn === dateStr);
            if (booking) setSelectedBooking(booking);
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TabBar tabs={tabs} activeTab={activeTab} onChangeTab={setActiveTab} />
          
          <div className="discover-premium-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>GUEST</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>LISTING</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>DATES</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>PAYMENT</th>
                  {activeTab === 'ongoing' && <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK-IN</th>}
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: 600 }}>{b.guestName}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{b.listingName}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{b.checkIn} to {b.checkOut}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: 700 }}>${b.pricePaid}</td>
                    {activeTab === 'ongoing' && (
                      <td style={{ padding: '16px 20px' }}>
                        <ToggleSwitch checked={!!b.checkedIn} onChange={() => handleToggleCheckin(b.id, !!b.checkedIn)} />
                      </td>
                    )}
                    <td style={{ padding: '16px 20px' }}>
                      <button 
                        onClick={() => setSelectedBooking(b)}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No reservations listed under this status filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div className="discover-premium-card" style={{ width: '400px', height: '100%', background: 'var(--bg-gradient)', borderLeft: '1px solid var(--card-border)', padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Reservation Details</h3>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}
                >
                  &times;
                </button>
              </header>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>GUEST NAME</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedBooking.guestName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{selectedBooking.guestEmail}</span>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>PROPERTY / SUITE</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBooking.listingName}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>CHECK IN</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBooking.checkIn}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>CHECK OUT</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedBooking.checkOut}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>TOTAL AMOUNT PAID</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>${selectedBooking.pricePaid}</span>
                </div>

                {selectedBooking.specialRequests && (
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>SPECIAL REQUESTS</span>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                      “{selectedBooking.specialRequests}”
                    </p>
                  </div>
                )}

                {selectedBooking.status === 'ongoing' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Guest Check-in Status</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Mark guest as present in room</span>
                    </div>
                    <ToggleSwitch checked={!!selectedBooking.checkedIn} onChange={() => handleToggleCheckin(selectedBooking.id, !!selectedBooking.checkedIn)} />
                  </div>
                )}
              </div>
            </div>

            <div>
              {selectedBooking.status === 'pending' ? (
                <ThreeTierButtonGroup 
                  buttons={[
                    {
                      label: 'Decline',
                      onClick: () => handleUpdateStatus(selectedBooking.id, 'cancelled'),
                      variant: 'outline'
                    },
                    {
                      label: 'Reschedule',
                      onClick: () => alert('Simulating Reschedule calendar window...'),
                      variant: 'secondary'
                    },
                    {
                      label: 'Approve Stay',
                      onClick: () => handleUpdateStatus(selectedBooking.id, 'upcoming'),
                      variant: 'primary'
                    }
                  ]}
                />
              ) : (
                <button 
                  onClick={() => setSelectedBooking(null)}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Close Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
