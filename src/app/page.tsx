'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, login, signup, logout, updateTravellerType } = useAuth();

  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [fadeClass, setFadeClass] = useState('');
  const [contentVisible, setContentVisible] = useState(false);

  // Form Switch States
  const [formMode, setFormMode] = useState<'login' | 'signup' | 'forgot_password' | 'verify_otp'>('login');
  const [userRole, setUserRole] = useState<'traveller' | 'business'>('traveller');
  const [showPassword, setShowPassword] = useState(false);

  // Input states (Common)
  const [identifier, setIdentifier] = useState(''); // email or username
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Birthday Selects
  const [birthMonth, setBirthMonth] = useState('Month');
  const [birthDay, setBirthDay] = useState('Day');
  const [birthYear, setBirthYear] = useState('Year');

  // Traveller Specific Inputs
  const [isVlogger, setIsVlogger] = useState(false);

  // Business Specific Inputs
  const [businessType, setBusinessType] = useState<'agency' | 'hotel'>('agency');
  const [businessName, setBusinessName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bookingModel, setBookingModel] = useState<'direct' | 'redirect'>('direct');

  // Form UI Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Start splash sequence on mount
    const fadeTimeout = setTimeout(() => {
      setFadeClass('fade-out');
    }, 1800); // Zoom in for 1.8s

    const removalTimeout = setTimeout(() => {
      setShowSplash(false);
      setContentVisible(true);
    }, 2500); // Completely remove splash after 2.5s

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removalTimeout);
    };
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (formMode === 'forgot_password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(`${data.message} ${data.otp ? '(Simulated Email) Your OTP is: ' + data.otp : ''}`);
          setFormMode('verify_otp');
        } else {
          setErrorMsg(data.error || 'Failed to send OTP');
        }
      } else if (formMode === 'verify_otp') {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          setSubmitting(false);
          return;
        }
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword: password })
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMsg('Password successfully reset! You can now log in.');
          setFormMode('login');
          setOtp('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setErrorMsg(data.error || 'Failed to reset password');
        }
      } else if (formMode === 'login') {
        const result = await login(identifier, password);
        if (result.success) {
          setSuccessMsg('Logged in successfully!');
          setIdentifier('');
          setPassword('');
        } else {
          setErrorMsg(result.error || 'Invalid credentials');
        }
      } else {
        // Sign Up Flow
        const signupData: any = {
          role: userRole,
          username,
          email,
          password,
          fullName,
          phone: phone || undefined,
        };

        if (userRole === 'traveller') {
          signupData.travellerType = isVlogger ? 'vlogger' : 'normal';
        } else {
          signupData.businessType = businessType;
          signupData.businessName = businessName;
          signupData.registrationNumber = registrationNumber;
          signupData.address = address;
          signupData.websiteUrl = websiteUrl || undefined;
          signupData.bookingModel = bookingModel;
          signupData.phone = phone; // Business accounts must have phone
        }

        const result = await signup(signupData);
        if (result.success) {
          setSuccessMsg('Account created successfully!');
          setUsername('');
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
          setBusinessName('');
          setRegistrationNumber('');
          setAddress('');
          setWebsiteUrl('');
        } else {
          setErrorMsg(result.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Traveller Type directly on Dashboard
  const handleDashboardToggleVlogger = async (checked: boolean) => {
    const targetType = checked ? 'vlogger' : 'normal';
    const result = await updateTravellerType(targetType);
    if (!result.success) {
      alert(result.error || 'Failed to switch profile type');
    }
  };

  // Helper arrays for Birthday drop downs
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 80 }, (_, i) => String(2026 - i));

  if (loading) {
    return (
      <div className="splash-container">
        <Logo theme={theme} width={100} showText={true} />
      </div>
    );
  }

  return (
    <div className="split-screen-container">
      
      {/* --- LEFT PANEL: Branding & Visual Showcase --- */}
      <div className="left-pane">
        <Logo theme={theme} width={120} />
        <h2 className="left-brand-text">
          See everyday moments from your <span className="gradient-text">travel buddies</span>.
        </h2>
        <p className="left-brand-sub">
          The unified travel network connecting vloggers, explorers, hotels, and agencies.
        </p>

        {/* CSS-based overlapping phone screen cards stack */}
        <div className="cards-stack-container">
          {/* Phone Card 1: Traveller Hike */}
          <div className="phone-card phone-card-1">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#f4a261' }} />
              <span className="phone-username">wander_sam</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #2a9d8f, #e76f51)' }}>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 600 }}>
                🏔️ Manali peaks
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">First summit! 🌄 #wanderlust</span>
            </div>
          </div>

          {/* Phone Card 2: Hotel/Stay Provider */}
          <div className="phone-card phone-card-2">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#e76f51' }} />
              <span className="phone-username">villa_goa</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #1d3557, #457b9d)' }}>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 600 }}>
                🌴 Luxury Stays
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">Book private villas direct! 🌊</span>
            </div>
          </div>

          {/* Phone Card 3: Vlogger Stream */}
          <div className="phone-card phone-card-3">
            <div className="phone-card-header">
              <div className="phone-avatar" style={{ background: '#2a9d8f' }} />
              <span className="phone-username">nomad_vlogs</span>
            </div>
            <div className="phone-image-body" style={{ background: 'linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045)' }}>
              <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', padding: '2px 5px', borderRadius: '3px', fontSize: '7px', fontWeight: 800 }}>
                LIVE
              </div>
            </div>
            <div className="phone-card-footer">
              <span className="phone-actions">❤️ 💬 🚀</span>
              <span className="phone-caption">Exploring hidden waterfalls... 💦</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Interactive Form & Context --- */}
      <div className="right-pane">
        
        {/* Top-Right Header Actions */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 50 }}>
          {user && (
            <button
              onClick={logout}
              className="theme-toggle-btn"
              style={{ position: 'static' }}
              aria-label="Log Out"
              title="Log Out"
            >
              {/* Door Exit Logout Icon */}
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 13v-2H10V9l-5 3 5 3v-2h6zM20 3H9c-1.1 0-2 .9-2 2v4h2V5h11v14H9v-4H7v4c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{ position: 'static' }}
            aria-label="Toggle dark/light mode"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.7.5-.1 1 .2 1.2.7.2.5.1 1.1-.3 1.4-2.8 2.2-4.2 5.7-3.6 9.3.8 4.4 4.5 7.8 9 8.1 2.3.1 4.5-.6 6.2-2 .4-.3.9-.3 1.3-.1.4.3.6.8.5 1.3-.8 4.7-4.9 8-9.7 8.3z"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0-5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1V3c0-.6.4-1 1-1zm0 14c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2c0-.6.4-1 1-1zM4 12c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1H5c-.6 0-1-.4-1-1zm14 0c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1h-2c-.6 0-1-.4-1-1zM5.2 6.6c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4s-1 .4-1.4 0L5.2 8c-.4-.4-.4-1 0-1.4zm10.6 10.6c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4s-1 .4-1.4 0l-1.4-1.4c-.4-.4-.4-1 0-1.4zm0-10.6c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0zM7.2 16.2c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l1.4-1.4c.4-.4 1-.4 1.4 0z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Right Pane Startup Splash Screen */}
        {showSplash && !user && (
          <div className={`splash-container ${fadeClass}`}>
            <div className="splash-logo-wrapper">
              <Logo theme={theme} width={130} showText={true} />
            </div>
          </div>
        )}

        {/* --- Form Context Inner Wrapper --- */}
        <div className={`form-inner-wrapper ${(contentVisible || user) ? 'visible' : ''}`}>
          
          {/* Logo Header (re-appears at top of form) */}
          <div className="logo-header">
            <Logo theme={theme} width={90} />
          </div>

          {user ? (
            /* --- User Dashboard View --- */
            <div style={{ width: '100%' }}>
              <h2 className="form-title" style={{ textAlign: 'left', fontSize: '24px' }}>Welcome back, {user.fullName}!</h2>
              <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Logged in as @{user.username}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
                
                <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '14px 16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.email}</span>
                </div>

                {/* Specific Panels for Traveller vs Business */}
                {user.role === 'traveller' ? (
                  <div className="toggle-group">
                    <div>
                      <span className="toggle-title">Vlogger Account Mode</span>
                      <span className="toggle-desc" style={{ display: 'block' }}>
                        {user.travellerType === 'vlogger' 
                          ? 'You are active as a travel Vlogger.' 
                          : 'Toggle to activate vlogger status.'}
                      </span>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={user.travellerType === 'vlogger'} 
                        onChange={(e) => handleDashboardToggleVlogger(e.target.checked)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ) : (
                  /* Business details panel */
                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Venture Details
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Name</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>{user.businessProfile?.businessName}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Type</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', textTransform: 'capitalize' }}>{user.businessProfile?.businessType}</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Address</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, display: 'block' }}>{user.businessProfile?.address}</span>
                    </div>

                    <div style={{ padding: '10px', background: 'var(--right-pane-bg)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, display: 'block' }}>Booking Model</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {user.businessProfile?.bookingModel === 'direct' ? (
                          '🟢 Direct in-app bookings active (paycut model).'
                        ) : (
                          '🔗 Redirect bookings (external link).'
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={logout} className="btn-primary" style={{ background: 'var(--accent-red)', boxShadow: 'none' }}>
                Sign Out
              </button>
            </div>
          ) : (
            /* --- Sign In / Sign Up Forms View --- */
            <div style={{ width: '100%' }}>
              
              {/* Form Feedback */}
              {errorMsg && <div className="status-msg error">{errorMsg}</div>}
              {successMsg && <div className="status-msg success">{successMsg}</div>}

              {formMode === 'forgot_password' ? (
                /* --- FORGOT PASSWORD VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Reset Password</h2>
                  <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Enter your email address and we'll generate a link to get back into your account.</p>
                  
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Sending link...' : 'Send Reset Link'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 18px', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }} />
                  </div>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => { setFormMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Back to Log in
                  </button>
                </form>
              ) : formMode === 'verify_otp' ? (
                /* --- VERIFY OTP VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Enter OTP</h2>
                  <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Enter the 6-digit code sent to your email to reset your password.</p>
                  
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="password"
                        className="form-input"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Resetting...' : 'Reset Password'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 18px', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }} />
                  </div>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => { setFormMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Back to Log in
                  </button>
                </form>
              ) : formMode === 'login' ? (
                /* --- LOG IN VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ display: 'none' }}>Log into Travora</h2>
                  <p className="form-subtitle" style={{ display: 'none' }}>Log in to see photos and videos from your travel buddies.</p>
                  
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Mobile number, username or email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log in'}
                  </button>

                  <a className="text-link-center" href="#forgot" onClick={(e) => { e.preventDefault(); setFormMode('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }}>
                    Forgot password?
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', margin: '0 18px', textTransform: 'uppercase' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--input-border)' }}></div>
                  </div>

                  {/* Switch to SignUp Outline Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => { setFormMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    Create new account
                  </button>
                </form>
              ) : (
                /* --- SIGN UP VIEW --- */
                <form onSubmit={handleSubmit}>
                  <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Get started on Travora</h2>
                  <p className="form-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>Sign up to see photos and videos from your friends.</p>

                  {/* Traveller vs Venture Sub-tabs */}
                  <div className="tabs-container" style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      className={`tab-btn ${userRole === 'traveller' ? 'active' : ''}`}
                      onClick={() => { setUserRole('traveller'); setErrorMsg(''); }}
                    >
                      Traveller
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${userRole === 'business' ? 'active' : ''}`}
                      onClick={() => { setUserRole('business'); setErrorMsg(''); }}
                    >
                      Ventures
                    </button>
                  </div>

                  {/* 1. Mobile number or email */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Mobile number or email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Password with visibility toggle */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* 3. Birthday */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Birthday</label>
                    <div className="birthday-grid">
                      <select className="form-input" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Month</option>
                        {months.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="form-input" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Day</option>
                        {days.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className="form-input" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ padding: '12px 10px' }}>
                        <option disabled>Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 4. Full Name */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 5. Username */}
                  <div className="form-group">
                    <div className="form-input-container">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Traveller Onboard Fields */}
                  {userRole === 'traveller' ? (
                    <div className="toggle-group">
                      <div>
                        <span className="toggle-title">Join as a Travel Vlogger</span>
                        <span className="toggle-desc" style={{ display: 'block' }}>Share journeys as a vlogger.</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isVlogger}
                          onChange={(e) => setIsVlogger(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ) : (
                    /* Ventures Onboard Fields */
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Venture Name (Agency/Stay)"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                        <select
                          className="form-input"
                          value={businessType}
                          onChange={(e: any) => setBusinessType(e.target.value)}
                          style={{ padding: '12px 10px' }}
                        >
                          <option value="agency">Agency / Tour</option>
                          <option value="hotel">Hotel / Stay</option>
                        </select>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="License No."
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="Venture Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Venture Street Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="url"
                          className="form-input"
                          placeholder="Website URL (Optional)"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Booking Flow</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                          <label style={{ display: 'flex', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${bookingModel === 'direct' ? 'var(--primary)' : 'var(--input-border)'}`, background: bookingModel === 'direct' ? 'var(--primary-glow)' : 'var(--input-bg)', cursor: 'pointer', gap: '10px', alignItems: 'center' }}>
                            <input type="radio" name="bookingModel" checked={bookingModel === 'direct'} onChange={() => setBookingModel('direct')} style={{ accentColor: 'var(--primary)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>📥 In-app Direct Booking (Paycut)</span>
                          </label>
                          <label style={{ display: 'flex', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${bookingModel === 'redirect' ? 'var(--primary)' : 'var(--input-border)'}`, background: bookingModel === 'redirect' ? 'var(--primary-glow)' : 'var(--input-bg)', cursor: 'pointer', gap: '10px', alignItems: 'center' }}>
                            <input type="radio" name="bookingModel" checked={bookingModel === 'redirect'} onChange={() => setBookingModel('redirect')} style={{ accentColor: 'var(--primary)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>🔗 External Redirection</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Submit'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => { setFormMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  >
                    I already have an account
                  </button>
                </form>
              )}

              {/* Page Footer Navigation Links */}
              <div className="page-footer">
                <div className="footer-nav">
                  <a className="footer-nav-link" href="#about">About</a>
                  <a className="footer-nav-link" href="#blog">Blog</a>
                  <a className="footer-nav-link" href="#jobs">Jobs</a>
                  <a className="footer-nav-link" href="#help">Help</a>
                  <a className="footer-nav-link" href="#api">API</a>
                  <a className="footer-nav-link" href="#privacy">Privacy</a>
                  <a className="footer-nav-link" href="#terms">Terms</a>
                  <a className="footer-nav-link" href="#locations">Locations</a>
                </div>
                <div className="footer-copy">
                  © 2026 Travora
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
