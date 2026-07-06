'use client';

import React, { useState } from 'react';

interface BookingItem {
  id: string;
  guestName: string;
  listingName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'pending';
  pricePaid: number;
}

interface BookingCalendarProps {
  bookings: BookingItem[];
  onSelectDate?: (dateStr: string) => void;
  style?: React.CSSProperties;
}

export default function BookingCalendar({ bookings, onSelectDate, style }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonthDays = getDaysInMonth(currentMonth - 1 < 0 ? 11 : currentMonth - 1, currentMonth - 1 < 0 ? currentYear - 1 : currentYear);

  const daysArray = [];

  // Previous month fill days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const month = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
    const year = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
    daysArray.push({ day, isCurrentMonth: false, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({ day: i, isCurrentMonth: true, dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
  }

  // Next month fill days to fill up a grid of 35 or 42
  const remainingCells = 42 - daysArray.length;
  for (let i = 1; i <= remainingCells; i++) {
    const month = currentMonth + 1 > 11 ? 0 : currentMonth + 1;
    const year = currentMonth + 1 > 11 ? currentYear + 1 : currentYear;
    daysArray.push({ day: i, isCurrentMonth: false, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getStatusColor = (status: BookingItem['status']) => {
    switch (status) {
      case 'upcoming': return 'rgba(59, 130, 246, 0.15)'; // blue
      case 'ongoing': return 'rgba(16, 185, 129, 0.15)'; // green
      case 'completed': return 'rgba(148, 163, 184, 0.1)'; // slate
      case 'cancelled': return 'rgba(244, 63, 94, 0.1)'; // rose
      case 'pending': return 'rgba(245, 158, 11, 0.15)'; // amber
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  const getStatusTextColor = (status: BookingItem['status']) => {
    switch (status) {
      case 'upcoming': return '#60a5fa';
      case 'ongoing': return '#34d399';
      case 'completed': return '#cbd5e1';
      case 'cancelled': return '#fb7185';
      case 'pending': return '#fbbf24';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="discover-premium-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', ...style }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {monthNames[currentMonth]} {currentYear}
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            &larr;
          </button>
          <button onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            &rarr;
          </button>
        </div>
      </header>

      {/* Weekdays header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <span key={day} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{day}</span>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {daysArray.map((cell, idx) => {
          // Find bookings starting on this day or ongoing
          const dayBookings = bookings.filter(b => b.checkIn === cell.dateStr);
          
          return (
            <div 
              key={idx} 
              onClick={() => onSelectDate && onSelectDate(cell.dateStr)}
              style={{
                minHeight: '80px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.03)',
                background: cell.isCurrentMonth ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.002)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              className="calendar-day-cell"
            >
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: cell.isCurrentMonth ? 'var(--text-primary)' : 'rgba(255,255,255,0.15)' 
              }}>
                {cell.day}
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', overflowY: 'hidden' }}>
                {dayBookings.map(b => (
                  <div 
                    key={b.id} 
                    style={{
                      background: getStatusColor(b.status),
                      color: getStatusTextColor(b.status),
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 4px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      borderLeft: `2.5px solid ${getStatusTextColor(b.status)}`
                    }}
                    title={`${b.guestName} - ${b.listingName}`}
                  >
                    {b.guestName.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
