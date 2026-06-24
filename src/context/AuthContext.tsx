'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BusinessProfile {
  businessType: 'agency' | 'hotel';
  businessName: string;
  registrationNumber: string;
  phone: string;
  address: string;
  websiteUrl?: string;
  bookingModel: 'direct' | 'redirect';
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'traveller' | 'business';
  travellerType?: 'normal' | 'vlogger';
  businessProfile?: BusinessProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (signupData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateTravellerType: (type: 'normal' | 'vlogger') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user session on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during login' };
    }
  };

  const signup = async (signupData: any) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during signup' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout request error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateTravellerType = async (type: 'normal' | 'vlogger') => {
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travellerType: type }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (user) {
          setUser({ ...user, travellerType: type });
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Profile update failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred during update' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateTravellerType }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
