'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// --- Types ---

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

export interface SavedAccount {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'traveller' | 'business';
  travellerType?: 'normal' | 'vlogger';
  businessProfile?: BusinessProfile;
  isActive: boolean;
  lastActiveAt: string;
  sessionExpired: boolean;
}

interface AuthContextType {
  user: User | null;
  savedAccounts: SavedAccount[];
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (signupData: any) => Promise<{ success: boolean; error?: string }>;
  logout: (userId?: string) => Promise<void>;
  logoutAll: () => Promise<void>;
  switchAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  removeAccount: (userId: string) => Promise<void>;
  refreshSavedAccounts: () => Promise<void>;
  updateTravellerType: (type: 'normal' | 'vlogger') => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (identifier: string) => Promise<{ success: boolean; error?: string; simulatedOtp?: string }>;
  verifyOtp: (identifier: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (identifier: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Helpers ---

function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('travora_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('travora_device_id', deviceId);
  }
  return deviceId;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('travora_access_token');
}

function storeTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem('travora_access_token', accessToken);
  // Also store as travora_token for backward compatibility
  localStorage.setItem('travora_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('travora_refresh_token', refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem('travora_access_token');
  localStorage.removeItem('travora_refresh_token');
  localStorage.removeItem('travora_token');
  // Clean up legacy items
  localStorage.removeItem('travora_sessions');
  localStorage.removeItem('travora_active_user_id');
}

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

// --- Provider ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved accounts from backend
  const refreshSavedAccounts = async () => {
    const deviceId = getDeviceId();
    const token = getStoredToken();
    if (!deviceId || !token) return;

    try {
      const response = await fetch(`/api/auth/saved-accounts?deviceId=${encodeURIComponent(deviceId)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.accounts) {
          setSavedAccounts(data.accounts);
        }
      }
    } catch (e) {
      console.error('Failed to fetch saved accounts:', e);
    }
  };

  // Initialize: check existing session, load saved accounts
  useEffect(() => {
    async function initSession() {
      try {
        const token = getStoredToken();
        const deviceId = getDeviceId();

        // Migration: if old travora_sessions exists but no access_token, migrate
        if (!token) {
          const oldToken = localStorage.getItem('travora_token');
          if (oldToken && oldToken !== 'null' && oldToken !== 'undefined') {
            localStorage.setItem('travora_access_token', oldToken);
            // Try to validate this old token
            const meResponse = await fetch('/api/auth/me', {
              headers: { 'Authorization': `Bearer ${oldToken}` },
            });
            if (meResponse.ok) {
              const meData = await meResponse.json();
              if (meData.success && meData.user) {
                setUser(meData.user);
                storeTokens(oldToken);
              }
            }
            setLoading(false);
            return;
          }
          setLoading(false);
          return;
        }

        // Validate current access token
        const meResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          if (meData.success && meData.user) {
            setUser(meData.user);
            // Load saved accounts from backend
            if (deviceId) {
              try {
                const savedResponse = await fetch(`/api/auth/saved-accounts?deviceId=${encodeURIComponent(deviceId)}`, {
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                if (savedResponse.ok) {
                  const savedData = await savedResponse.json();
                  if (savedData.success && savedData.accounts) {
                    setSavedAccounts(savedData.accounts);
                  }
                }
              } catch {
                // Saved accounts fetch is non-critical — device_sessions table may not exist yet
              }
            }
          } else {
            clearTokens();
          }
        } else {
          // Token invalid — try refresh
          const refreshToken = localStorage.getItem('travora_refresh_token');
          if (refreshToken && deviceId) {
            // Attempt refresh — but we need userId which we don't have if token is invalid
            // In this case, just clear and require re-login
            clearTokens();
          } else {
            clearTokens();
          }
        }
      } catch (error) {
        console.error('Session init failed:', error);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  // --- Auth Methods ---

  const login = async (identifier: string, password: string) => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, deviceId }),
      });

      const data = await handleResponse(response, 'Login failed');
      if (response.ok && data.success) {
        const accessToken = data.accessToken || data.token;
        storeTokens(accessToken, data.refreshToken);
        setUser(data.user);

        // Refresh saved accounts list
        setTimeout(() => refreshSavedAccounts(), 100);

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
      const deviceId = getDeviceId();
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signupData, deviceId }),
      });

      const data = await handleResponse(response, 'Signup failed');
      if (response.ok && data.success) {
        const accessToken = data.accessToken || data.token;
        storeTokens(accessToken, data.refreshToken);
        setUser(data.user);

        setTimeout(() => refreshSavedAccounts(), 100);

        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error. Please check if your backend server is running on port 5000.' };
    }
  };

  const switchAccount = async (userId: string) => {
    try {
      const deviceId = getDeviceId();
      const token = getStoredToken();

      if (!token || !deviceId) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/auth/switch-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, targetUserId: userId }),
      });

      const data = await handleResponse(response, 'Switch failed');

      if (response.ok && data.success) {
        const accessToken = data.accessToken || data.token;
        storeTokens(accessToken, data.refreshToken);
        setUser(data.user);

        // Refresh saved accounts to update active states
        setTimeout(() => refreshSavedAccounts(), 100);

        return { success: true };
      } else {
        // If session expired, the UI should prompt re-login for that account
        return { success: false, error: data.error || data.message || 'Switch failed' };
      }
    } catch (error: any) {
      return { success: false, error: 'Network error during account switch.' };
    }
  };

  const removeAccount = async (userId: string) => {
    try {
      const deviceId = getDeviceId();
      const token = getStoredToken();
      if (!token || !deviceId) return;

      const response = await fetch('/api/auth/remove-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId, targetUserId: userId }),
      });

      const data = await handleResponse(response, 'Remove failed');

      if (response.ok && data.success) {
        if (data.newActiveUser) {
          setUser(data.newActiveUser);
          storeTokens(data.accessToken, data.refreshToken);
        } else if (user?.id === userId) {
          // No accounts left
          setUser(null);
          clearTokens();
        }
        setSavedAccounts(data.remainingAccounts || []);
      }
    } catch (error) {
      console.error('Remove account error:', error);
    }
  };

  const logout = async (userIdToLogout?: string) => {
    try {
      const targetId = userIdToLogout || user?.id;
      if (!targetId) return;

      if (targetId === user?.id) {
        // Logging out the active account
        const deviceId = getDeviceId();
        const token = getStoredToken();
        if (token && deviceId) {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ deviceId }),
          });

          const data = await handleResponse(response, 'Logout failed');
          if (data.success) {
            if (data.newActiveUser) {
              setUser(data.newActiveUser);
              storeTokens(data.accessToken, data.refreshToken);
            } else {
              setUser(null);
              clearTokens();
            }
            setSavedAccounts(data.remainingAccounts || []);
            return;
          }
        }
      }

      // Logging out a non-active account is the same as removing it
      await removeAccount(targetId);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const logoutAll = async () => {
    try {
      const deviceId = getDeviceId();
      const token = getStoredToken();
      if (!token || !deviceId) {
        setUser(null);
        clearTokens();
        setSavedAccounts([]);
        return;
      }

      await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceId }),
      });

      setUser(null);
      clearTokens();
      setSavedAccounts([]);
    } catch (error) {
      console.error('Logout all error:', error);
      setUser(null);
      clearTokens();
      setSavedAccounts([]);
    }
  };

  const updateTravellerType = async (type: 'normal' | 'vlogger') => {
    try {
      if (!user) return { success: false, error: 'Not logged in' };
      const token = getStoredToken();
      if (!token) return { success: false, error: 'Session not found' };

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ travellerType: type }),
      });

      const data = await handleResponse(response, 'Profile update failed');
      if (response.ok && data.success) {
        const updatedUser = { ...user, travellerType: type };
        setUser(updatedUser);
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
    <AuthContext.Provider value={{
      user,
      savedAccounts,
      loading,
      login,
      signup,
      logout,
      logoutAll,
      switchAccount,
      removeAccount,
      refreshSavedAccounts,
      updateTravellerType,
      forgotPassword,
      verifyOtp,
      resetPassword,
    }}>
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
