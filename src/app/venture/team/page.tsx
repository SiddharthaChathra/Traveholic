'use client';

import React, { useState } from 'react';
import RadioCard from '@/components/shared/RadioCard';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'support';
  avatar: string;
}

export default function VentureTeamPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [team, setTeam] = useState<TeamMember[]>([
    { id: 'team-1', name: 'Alexander Smith', email: 'alex@grandplaza.com', role: 'owner', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80' },
    { id: 'team-2', name: 'Sophia Miller', email: 'sophia@grandplaza.com', role: 'manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80' },
    { id: 'team-3', name: 'Daniel Craig', email: 'daniel@grandplaza.com', role: 'support', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' }
  ]);

  const auditLog = [
    { time: '2026-07-06 14:20', actor: 'Alexander Smith', action: 'Modified room rates for Deluxe Ocean Suite' },
    { time: '2026-07-06 10:15', actor: 'Sophia Miller', action: 'Approved reservation booking for Emma Watson' },
    { time: '2026-07-05 09:30', actor: 'Daniel Craig', action: 'Answered inquiry from guest regarding airport shuttle' }
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        role: role as any,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'
      };
      setTeam([...team, newMember]);
      setEmail('');
      alert(`Invitation sent to ${email.trim()}!`);
    }
  };

  const handleRemoveMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Team &amp; Staff Access
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Coordinate staff roles, assign supportive permissions, and audit recent administrative actions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active staff */}
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>Active Team</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {team.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={m.avatar} alt={m.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{m.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.email}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{
                      background: m.role === 'owner' ? 'rgba(236,72,153,0.15)' : m.role === 'manager' ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.15)',
                      color: m.role === 'owner' ? 'var(--primary)' : m.role === 'manager' ? '#60a5fa' : '#cbd5e1',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>
                      {m.role}
                    </span>
                    {m.role !== 'owner' && (
                      <button 
                        onClick={() => handleRemoveMember(m.id)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log */}
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Activity Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {auditLog.map((log, idx) => (
                <div key={idx} style={{ fontSize: '12px', borderLeft: '2px solid rgba(255,255,255,0.06)', paddingLeft: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>{log.time} - {log.actor}</span>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)' }}>{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invite Form */}
        <div>
          <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Invite Team Member</h3>
            
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. staff@grandplaza.com"
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Assign Access Role</label>
                <RadioCard 
                  options={[
                    { value: 'manager', label: 'Manager', description: 'Can edit listings, bookings, packages' },
                    { value: 'support', label: 'Support Staff', description: 'Can view calendar & reply to inquiries' }
                  ]}
                  selectedValue={role}
                  onChange={setRole}
                  columns={1}
                />
              </div>

              <button 
                type="submit"
                style={{ width: '100%', padding: '12px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}
              >
                Send Invite
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
