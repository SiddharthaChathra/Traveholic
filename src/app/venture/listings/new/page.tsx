'use client';

import React, { useState } from 'react';
import Stepper from '@/components/shared/Stepper';
import UploadMedia from '@/components/shared/UploadMedia';
import TagPill from '@/components/shared/TagPill';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import RadioCard from '@/components/shared/RadioCard';
import ThreeTierButtonGroup from '@/components/shared/ThreeTierButtonGroup';
import { useRouter } from 'next/navigation';

export default function AddListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // step 1: basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hotel');
  const [location, setLocation] = useState('');

  // step 2: photos & amenities
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const amenitiesList = ['Free WiFi', 'Swimming Pool', 'Air Conditioning', 'Spa Access', 'Fitness Gym', 'Ocean View', 'Restaurant', 'Bar & Lounge', 'Airport Shuttle'];

  // step 3: pricing
  const [priceMin, setPriceMin] = useState(150);
  const [priceMax, setPriceMax] = useState(300);
  const [availableRooms, setAvailableRooms] = useState(5);

  // step 4: policies
  const [cancellationPolicy, setCancellationPolicy] = useState('flexible');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');

  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Photos & Amenities' },
    { number: 3, label: 'Rooms & Pricing' },
    { number: 4, label: 'Policies' },
    { number: 5, label: 'Review' }
  ];

  const handleUploadImages = (files: File[]) => {
    // mock url generation
    const mockUrls = files.map((file, idx) => `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80`);
    setImages([...images, ...mockUrls]);
  };

  const handleToggleAmenity = (am: string) => {
    if (selectedAmenities.includes(am)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== am));
    } else {
      setSelectedAmenities([...selectedAmenities, am]);
    }
  };

  const handleSaveAndPublish = () => {
    alert('Listing created successfully!');
    router.push('/venture/listings');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Create New Listing</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Add a new hotel suite, villa, or experience package to your venture portfolio.</p>
      </div>

      <Stepper steps={steps} currentStep={step} onStepClick={setStep} />

      <div className="discover-premium-card" style={{ padding: '28px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Basic Information</h3>
            
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Property/Listing Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ocean View Sunset Suite"
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Category Type</label>
              <RadioCard 
                options={[
                  { value: 'hotel', label: 'Hotel Room', description: 'Standard guest rooms or suites' },
                  { value: 'villa', label: 'Private Villa', description: 'Exclusive residential properties' },
                  { value: 'bungalow', label: 'Beach Bungalow', description: 'Independent shoreline cabins' },
                  { value: 'cabana', label: 'Cabana', description: 'Small open shelters or cottages' }
                ]}
                selectedValue={category}
                onChange={setCategory}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property amenities, layout, and scenery..."
                rows={4}
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Location Address</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nusa Dua Beach Road No.12, Bali"
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Photos &amp; Amenities</h3>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Upload Gallery Images</label>
              <UploadMedia onUpload={handleUploadImages} accept="image/*" subtitle="Drop landscape photos of bedroom, bathroom, views" />
              
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '16px' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Select Available Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {amenitiesList.map(am => {
                  const isSel = selectedAmenities.includes(am);
                  return (
                    <TagPill 
                      key={am} 
                      label={am} 
                      isActive={isSel} 
                      onClick={() => handleToggleAmenity(am)} 
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Rooms &amp; Pricing</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Base Price Min ($/night)</label>
                <input 
                  type="number" 
                  value={priceMin} 
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Base Price Max ($/night)</label>
                <input 
                  type="number" 
                  value={priceMax} 
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Number of Available Units</label>
              <input 
                type="number" 
                value={availableRooms} 
                onChange={(e) => setAvailableRooms(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Booking Policies</h3>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Cancellation Policy</label>
              <RadioCard 
                options={[
                  { value: 'flexible', label: 'Flexible Refund', description: 'Full refund up to 24 hours prior to check-in' },
                  { value: 'moderate', label: 'Moderate Refund', description: 'Full refund up to 5 days prior to check-in' },
                  { value: 'nonrefundable', label: 'Non-Refundable', description: 'No refund on cancellations or modifications' }
                ]}
                selectedValue={cancellationPolicy}
                onChange={setCancellationPolicy}
                columns={1}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Check-in Time</label>
                <input 
                  type="text" 
                  value={checkInTime} 
                  onChange={(e) => setCheckInTime(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Check-out Time</label>
                <input 
                  type="text" 
                  value={checkOutTime} 
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Review &amp; Publish</h3>
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NAME</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{name || 'Unnamed Suite'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CATEGORY</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', display: 'block', textTransform: 'capitalize' }}>{category}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LOCATION</span>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{location || 'Not specified'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRICE RANGE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>${priceMin} - ${priceMax} / night</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>I agree to partner terms &amp; conditions for this listing</span>
              <ToggleSwitch checked={true} onChange={() => {}} />
            </div>
          </div>
        )}

        {/* Buttons flow */}
        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <ThreeTierButtonGroup 
            buttons={[
              {
                label: 'Cancel',
                onClick: () => router.push('/venture/listings'),
                variant: 'outline'
              },
              {
                label: 'Back',
                onClick: () => setStep(step - 1),
                variant: 'secondary',
                disabled: step === 1
              },
              {
                label: step === 5 ? 'Publish Listing' : 'Next Step',
                onClick: () => {
                  if (step === 5) {
                    handleSaveAndPublish();
                  } else {
                    setStep(step + 1);
                  }
                },
                variant: 'primary'
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
