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
  forgotPassword: (identifier: string) => Promise<{ success: boolean; error?: string; simulatedOtp?: string }>;
  verifyOtp: (identifier: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (identifier: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function handleResponse(response: Response, fallbackError: string) {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }
  
  if (response.status >= 500) {
    return {
      success: false,
      error: 'Could not connect to the backend service. Please check if your backend server is running on port 5000.'
    };
  }

  return { success: false, error: `${fallbackError} (Status: ${response.status})` };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user session on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const token = localStorage.getItem('travora_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await handleResponse(response, 'Session check failed');
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

      const data = await handleResponse(response, 'Login failed');
      if (response.ok && data.success) {
        localStorage.setItem('travora_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  const signup = async (signupData: any) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await handleResponse(response, 'Signup failed');
      if (response.ok && data.success) {
        localStorage.setItem('travora_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('travora_token');
      localStorage.removeItem('user_view_mode');
      // await fetch('/api/auth/me', { method: 'DELETE' }); // No longer needed with stateless JWT
    } catch (error) {
      console.error('Logout request error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateTravellerType = async (type: 'normal' | 'vlogger') => {
    try {
      const token = localStorage.getItem('travora_token');
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ travellerType: type }),
      });

      const data = await handleResponse(response, 'Profile update failed');
      if (response.ok && data.success) {
        if (user) {
          setUser({ ...user, travellerType: type });
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Profile update failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  const forgotPassword = async (identifier: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await handleResponse(response, 'Request failed');
      if (response.ok && data.success) {
        return { success: true, simulatedOtp: data.simulatedOtp };
      } else {
        return { success: false, error: data.error || 'Request failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp }),
      });
      const data = await handleResponse(response, 'Verification failed');
      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Verification failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  const resetPassword = async (identifier: string, otp: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      const data = await handleResponse(response, 'Reset failed');
      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Reset failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateTravellerType, forgotPassword, verifyOtp, resetPassword }}>
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
