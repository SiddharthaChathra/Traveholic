'use client';

import React, { useState } from 'react';

interface Message {
  id: string;
  sender: 'guest' | 'staff';
  text: string;
  time: string;
}

interface ChatThread {
  id: string;
  guestName: string;
  guestAvatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

export default function VentureMessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'thread-1',
      guestName: 'Emma Watson',
      guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'Will there be airport shuttle pickup ready at 9pm?',
      time: '10m ago',
      unread: true,
      messages: [
        { id: 'm-1', sender: 'guest', text: 'Hi! I am looking forward to my stay next week.', time: 'Yesterday' },
        { id: 'm-2', sender: 'staff', text: 'Hello Emma! We are excited to host you. Please let us know if you need anything.', time: 'Yesterday' },
        { id: 'm-3', sender: 'guest', text: 'Will there be airport shuttle pickup ready at 9pm?', time: '10m ago' }
      ]
    },
    {
      id: 'thread-2',
      guestName: 'Johnathan Doe',
      guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'Thank you for the quick check-in support!',
      time: '1h ago',
      unread: false,
      messages: [
        { id: 'm-4', sender: 'guest', text: 'Can I request extra towels?', time: '2h ago' },
        { id: 'm-5', sender: 'staff', text: 'Sure! Delivering extra towels to your villa now.', time: '1h ago' },
        { id: 'm-6', sender: 'guest', text: 'Thank you for the quick check-in support!', time: '1h ago' }
      ]
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState('thread-1');
  const [inputText, setInputText] = useState('');

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!finalMsg.trim()) return;

    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: finalMsg,
          time: 'Just now',
          unread: false,
          messages: [
            ...t.messages,
            {
              id: `msg-${Date.now()}`,
              sender: 'staff' as const,
              text: finalMsg,
              time: 'Just now'
            }
          ]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    if (!textToSend) setInputText('');
  };

  const quickTemplates = [
    { label: 'WiFi Details', text: 'The guest WiFi network is "GrandPlaza_Guest" and the password is "resort2026".' },
    { label: 'Check-in Guide', text: 'Standard check-in begins at 2:00 PM. Please present your digital booking card at the front desk.' },
    { label: 'Resort Map', text: 'Here is a map layout of our resort pools, garden villas, and dining spots.' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', height: 'calc(100vh - 160px)' }}>
      {/* Thread list */}
      <div className="discover-premium-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Guest Inquiries</h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {threads.map(t => {
            const isActive = t.id === activeThreadId;
            return (
              <div 
                key={t.id}
                onClick={() => {
                  setActiveThreadId(t.id);
                  // Mark as read
                  setThreads(threads.map(item => item.id === t.id ? { ...item, unread: false } : item));
                }}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                }}
              >
                <img src={t.guestAvatar} alt={t.guestName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.guestName}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.time}</span>
                  </div>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '11px',
                    color: t.unread ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: t.unread ? 700 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {t.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Conversation thread */}
      <div className="discover-premium-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img src={activeThread.guestAvatar} alt={activeThread.guestName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{activeThread.guestName}</span>
            <span style={{ fontSize: '10px', color: '#10b981' }}>Active Online</span>
          </div>
        </div>

        {/* Message history */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeThread.messages.map(m => {
            const isStaff = m.sender === 'staff';
            return (
              <div 
                key={m.id}
                style={{
                  alignSelf: isStaff ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isStaff ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  background: isStaff ? 'var(--brand-gradient)' : 'rgba(255,255,255,0.04)',
                  border: isStaff ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  color: isStaff ? 'white' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: isStaff ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>{m.time}</span>
              </div>
            );
          })}
        </div>

        {/* Templates quick menu */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
          {quickTemplates.map(tmp => (
            <button 
              key={tmp.label}
              onClick={() => handleSendMessage(tmp.text)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              + {tmp.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            placeholder="Type your reply here..."
            style={{ flex: 1, padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
          />
          <button 
            onClick={() => handleSendMessage()}
            style={{ background: 'var(--brand-gradient)', color: 'white', border: 'none', borderRadius: '10px', padding: '0 20px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
