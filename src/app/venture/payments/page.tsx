'use client';

import React, { useState } from 'react';
import StatCard from '@/components/venture/StatCard';

export default function VenturePaymentsPage() {
  const [bankName, setBankName] = useState('Chase Business Checking');
  const [accountNumber, setAccountNumber] = useState('•••• 9842');

  const payoutHistory = [
    { id: 'pay-1', date: '2026-07-01', amount: 12500, status: 'completed', invoiceNo: 'INV-2026-012' },
    { id: 'pay-2', date: '2026-06-01', amount: 9800, status: 'completed', invoiceNo: 'INV-2026-011' },
    { id: 'pay-3', date: '2026-05-01', amount: 14200, status: 'completed', invoiceNo: 'INV-2026-010' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Payments &amp; Payouts
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Monitor monthly earnings, coordinate payout schedules, and view tax invoices.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <StatCard title="GROSS EARNINGS (YEAR)" value={36500} prefix="$" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><line x1="12" y1="10" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>} />
        <StatCard title="PENDING PAYOUT" value={14200} prefix="$" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard title="NEXT PAYOUT DATE" value={0} prefix="July 15, " suffix="2026" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Payout history */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>Payout History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>DATE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>AMOUNT</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>INVOICE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map(pay => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{pay.date}</td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 700 }}>${pay.amount.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => alert(`Simulating Invoice download for ${pay.invoiceNo}`)}>{pay.invoiceNo}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank settings */}
        <div className="discover-premium-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Payout Method</h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{bankName}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct Deposit {accountNumber}</span>
            </div>
          </div>

          <button 
            onClick={() => alert('Editing payout details coming soon!')}
            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
          >
            Modify Bank Details
          </button>
        </div>
      </div>
    </div>
  );
}
