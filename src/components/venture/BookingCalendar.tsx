'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Use July 2026 as initial active calendar view to match mock data
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed: July
  const [currentYear, setCurrentYear] = useState(2026);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Simulated "Today" date to match the mock July 2026 dataset
  const todayDateStr = '2026-07-07';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  // Next month fill days
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

  const handleJumpToToday = () => {
    setCurrentMonth(6); // July
    setCurrentYear(2026);
  };

  const getDayOffset = (dateStr: string, offset: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="discover-premium-card" 
      style={{ 
        padding: '24px', 
        borderRadius: '16px', 
        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--glass-bg-extra-subtle, rgba(255,255,255,0.01)) 100%)', 
        border: '1px solid var(--card-border)', 
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        ...style 
      }}
    >
      {/* Calendar Header with Navigation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-title)' }}>
            {monthNames[currentMonth]} {currentYear}
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={handleJumpToToday}
            style={{ 
              background: 'var(--glass-bg-subtle, rgba(255,255,255,0.03))', 
              border: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.06))', 
              borderRadius: '8px', 
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              transition: 'background 0.2s'
            }}
            className="btn-shimmer-sweep"
          >
            Today
          </button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={handlePrevMonth} style={{ background: 'var(--glass-bg-subtle, rgba(255,255,255,0.03))', border: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.06))', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              &larr;
            </button>
            <button onClick={handleNextMonth} style={{ background: 'var(--glass-bg-subtle, rgba(255,255,255,0.03))', border: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.06))', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              &rarr;
            </button>
          </div>
        </div>
      </header>

      {/* Summary strip */}
      <div style={{
        display: 'flex',
        gap: '24px',
        padding: '12px 16px',
        background: 'var(--glass-bg-flat, rgba(255, 255, 255, 0.02))',
        border: '1px solid var(--glass-border-subtle, rgba(255, 255, 255, 0.04))',
        borderRadius: '12px',
        marginBottom: '20px',
        fontSize: '12px',
        fontWeight: 600,
        flexWrap: 'wrap'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Bookings this month:</span>{' '}
          <strong style={{ color: 'var(--primary)' }}>{bookings.length}</strong>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border-subtle, rgba(255,255,255,0.08))' }} />
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Pending Approval:</span>{' '}
          <strong style={{ color: '#fbbf24' }}>{bookings.filter(b => b.status === 'pending').length}</strong>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border-subtle, rgba(255,255,255,0.08))' }} />
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Occupancy Rate:</span>{' '}
          <strong style={{ color: '#34d399' }}>78%</strong>
        </div>
      </div>

      {/* Legend row between stats strip and calendar grid */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        flexWrap: 'wrap', 
        marginBottom: '20px',
        fontSize: '11px',
        fontWeight: 600,
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ color: 'var(--text-muted)' }}>Confirmed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: 'var(--text-muted)' }}>Checked-in</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ color: 'var(--text-muted)' }}>Pending Approval</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
          <span style={{ color: 'var(--text-muted)' }}>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', border: '1px dashed #f43f5e', boxSizing: 'border-box' }} />
          <span style={{ color: 'var(--text-muted)' }}>Cancelled</span>
        </div>
      </div>

      {/* Weekdays header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <span key={day} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day}</span>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentMonth}-${currentYear}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}
          >
            {daysArray.map((cell, idx) => {
              // Find bookings that cover this date (from checkIn inclusive to checkOut exclusive)
              const dayBookings = bookings.filter(b => cell.dateStr >= b.checkIn && cell.dateStr < b.checkOut);
              const isToday = cell.dateStr === todayDateStr;
              const isWeekend = (idx % 7 === 0 || idx % 7 === 6);
              const isPast = cell.dateStr < todayDateStr;

              return (
                <motion.div 
                  key={idx} 
                  onHoverStart={() => setHoveredDay(cell.dateStr)}
                  onHoverEnd={() => setHoveredDay(null)}
                  onClick={() => onSelectDate && onSelectDate(cell.dateStr)}
                  whileHover={{ y: -2, zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
                  style={{
                    minHeight: '90px',
                    borderRadius: '8px',
                    border: isToday ? '1.5px solid var(--primary)' : '1px solid var(--glass-border-subtle, rgba(255,255,255,0.03))',
                    boxShadow: isToday ? '0 0 10px rgba(236,72,153,0.15)' : 'none',
                    background: isWeekend 
                      ? 'var(--glass-bg-flat, rgba(255,255,255,0.02))' 
                      : (cell.isCurrentMonth ? 'var(--glass-bg-extra-subtle, rgba(255,255,255,0.008))' : 'var(--glass-bg-micro, rgba(255,255,255,0.002))'),
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    opacity: isPast ? 0.45 : 1,
                    transition: 'border-color 0.2s, opacity 0.2s'
                  }}
                >
                  {/* Day number */}
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 800, 
                    color: isToday 
                      ? 'var(--primary)' 
                      : (cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted-glass, rgba(255,255,255,0.15))'),
                    alignSelf: 'flex-start'
                  }}>
                    {cell.day}
                  </span>
                  
                  {/* Bookings status dots list */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', zIndex: 5, overflow: 'visible' }}>
                    {dayBookings.map(b => {
                      const isCheckIn = cell.dateStr === b.checkIn;
                      
                      // Status dot visual styling
                      let dotColor = '#3b82f6'; // Confirmed/Upcoming
                      let statusText = 'Confirmed';

                      if (b.status === 'ongoing') {
                        dotColor = '#10b981';
                        statusText = 'Checked-in';
                      } else if (b.status === 'pending') {
                        dotColor = '#f59e0b';
                        statusText = 'Pending Approval';
                      } else if (b.status === 'completed') {
                        dotColor = '#64748b';
                        statusText = 'Completed';
                      } else if (b.status === 'cancelled') {
                        dotColor = '#f43f5e';
                        statusText = 'Cancelled';
                      }

                      return (
                        <div 
                          key={b.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.04))',
                            fontSize: '9px',
                            fontWeight: 700,
                            maxWidth: '100%',
                            overflow: 'hidden'
                          }}
                          title={`${b.guestName} (${statusText})`}
                        >
                          <span 
                            style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              background: dotColor,
                              boxShadow: `0 0 6px ${dotColor}`,
                              flexShrink: 0
                            }} 
                          />
                          {isCheckIn && (
                            <span 
                              style={{ 
                                color: b.status === 'cancelled' ? '#f43f5e' : 'var(--text-secondary)',
                                textDecoration: b.status === 'cancelled' ? 'line-through' : 'none',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden'
                              }}
                            >
                              {b.guestName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Empty cell indicator */}
                    {dayBookings.length === 0 && cell.isCurrentMonth && (
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.12)', marginTop: '20px', display: 'block' }}>
                        3 available
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
