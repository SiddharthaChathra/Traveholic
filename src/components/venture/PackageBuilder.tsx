'use client';

import React, { useState } from 'react';
import ToggleSwitch from '../shared/ToggleSwitch';
import TagPill from '../shared/TagPill';
import { motion } from 'framer-motion';

interface PackageBuilderProps {
  onSave: (data: any) => void;
  initialData?: any;
}

export default function PackageBuilder({ onSave, initialData }: PackageBuilderProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 199);
  const [durationDays, setDurationDays] = useState(initialData?.durationDays || 3);
  
  // inclusions
  const [includesStay, setIncludesStay] = useState(initialData?.includesStay ?? true);
  const [includesTour, setIncludesTour] = useState(initialData?.includesTour ?? true);
  const [includesTransport, setIncludesTransport] = useState(initialData?.includesTransport ?? false);
  const [includesGuide, setIncludesGuide] = useState(initialData?.includesGuide ?? false);

  const [features, setFeatures] = useState<string[]>(initialData?.features || ['Breakfast included', 'Welcome drinks', 'Free WiFi']);
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature)) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (f: string) => {
    setFeatures(features.filter(item => item !== f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: Number(price),
      durationDays: Number(durationDays),
      inclusions: {
        stay: includesStay,
        tour: includesTour,
        transport: includesTransport,
        guide: includesGuide
      },
      features
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-group">
        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Package Title</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          placeholder="e.g. Bali Getaway Adventure"
          style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Description</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          placeholder="Describe what makes this package special..."
          rows={4}
          style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Duration (Days)</label>
          <input 
            type="number" 
            value={durationDays} 
            onChange={(e) => setDurationDays(Number(e.target.value))} 
            min={1}
            required 
            style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Bundle Price ($)</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(Number(e.target.value))} 
            min={1}
            required 
            style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.06))', paddingTop: '20px', marginTop: '10px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '16px', fontSize: '14px', fontWeight: 700 }}>Package Inclusions</label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Luxury Stay</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Include accommodation nights in the bundle</span>
            </div>
            <ToggleSwitch checked={includesStay} onChange={setIncludesStay} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Guided Tour</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Include activities or tours managed by operators</span>
            </div>
            <ToggleSwitch checked={includesTour} onChange={setIncludesTour} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Local Transport</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Airport transfers or daily car rental included</span>
            </div>
            <ToggleSwitch checked={includesTransport} onChange={setIncludesTransport} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Dedicated Guide</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Personal guide fluent in english/native speech</span>
            </div>
            <ToggleSwitch checked={includesGuide} onChange={setIncludesGuide} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border-subtle, rgba(255,255,255,0.06))', paddingTop: '20px', marginTop: '10px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Custom Features & Amenities</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input 
            type="text" 
            value={newFeature} 
            onChange={(e) => setNewFeature(e.target.value)} 
            placeholder="e.g. Free spa voucher"
            style={{ flex: 1, padding: '10px 12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '13px' }}
          />
          <button 
            type="button" 
            onClick={handleAddFeature}
            style={{ padding: '10px 16px', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
          >
            Add
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {features.map((f, idx) => (
            <TagPill 
              key={idx} 
              label={f} 
              isActive={true} 
              onClick={() => handleRemoveFeature(f)} 
              icon={
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              }
            />
          ))}
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        style={{ width: '100%', padding: '14px', background: 'var(--brand-gradient)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px', marginTop: '10px', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}
        className="btn-shimmer-sweep"
      >
        Save Bundle Package
      </motion.button>
    </form>
  );
}
