import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

// --- Token Generation ---

export function generateAccessToken(user: { id: string; username: string; email: string; role: string }) {
  return jwt.sign(
    { userId: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

// --- Device Session Management ---

const REFRESH_TOKEN_TTL_DAYS = 30;

export async function createOrUpdateDeviceSession(params: {
  deviceId: string;
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  setActive?: boolean;
}) {
  const { deviceId, userId, refreshToken, userAgent, ipAddress, setActive = true } = params;
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // If setActive, deactivate all other sessions on this device first
  if (setActive) {
    await supabase
      .from('device_sessions')
      .update({ is_active: false })
      .eq('device_id', deviceId);
  }

  // Upsert the session for this (device, user) pair
  const { error } = await supabase
    .from('device_sessions')
    .upsert(
      {
        device_id: deviceId,
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        is_active: setActive,
        last_active_at: new Date().toISOString(),
        user_agent: userAgent || null,
        ip_address: ipAddress || null,
        expires_at: expiresAt,
      },
      { onConflict: 'device_id,user_id' }
    );

  if (error) {
    console.error('Failed to create/update device session:', error);
    throw error;
  }
}

export async function getDeviceSession(deviceId: string, userId: string) {
  const { data, error } = await supabase
    .from('device_sessions')
    .select('*')
    .eq('device_id', deviceId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getSavedAccountsForDevice(deviceId: string) {
  const { data: sessions } = await supabase
    .from('device_sessions')
    .select('user_id, is_active, last_active_at, expires_at')
    .eq('device_id', deviceId)
    .order('last_active_at', { ascending: false });

  if (!sessions || sessions.length === 0) return [];

  // Fetch user profiles for all saved accounts
  const userIds = sessions.map(s => s.user_id);
  const { data: users } = await supabase
    .from('users')
    .select('id, username, email, full_name, avatar_url, role, traveller_type')
    .in('id', userIds);

  if (!users) return [];

  // Fetch business profiles for business users
  const businessUserIds = users.filter(u => u.role === 'business').map(u => u.id);
  let businessProfiles: any[] = [];
  if (businessUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('business_profiles')
      .select('*')
      .in('user_id', businessUserIds);
    businessProfiles = profiles || [];
  }

  return sessions.map(session => {
    const user = users.find(u => u.id === session.user_id);
    if (!user) return null;
    
    const businessProfile = businessProfiles.find(bp => bp.user_id === user.id);
    const isExpired = new Date(session.expires_at) < new Date();

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      role: user.role,
      travellerType: user.role === 'traveller' ? user.traveller_type : undefined,
      businessProfile: businessProfile ? {
        businessType: businessProfile.business_type,
        businessName: businessProfile.business_name,
        registrationNumber: businessProfile.registration_number,
        phone: businessProfile.phone,
        address: businessProfile.address,
        websiteUrl: businessProfile.website_url,
        bookingModel: businessProfile.booking_model,
      } : undefined,
      isActive: session.is_active,
      lastActiveAt: session.last_active_at,
      sessionExpired: isExpired,
    };
  }).filter(Boolean);
}

export async function removeDeviceSession(deviceId: string, userId: string) {
  const { error } = await supabase
    .from('device_sessions')
    .delete()
    .eq('device_id', deviceId)
    .eq('user_id', userId);

  return !error;
}

export async function removeAllDeviceSessions(deviceId: string) {
  const { error } = await supabase
    .from('device_sessions')
    .delete()
    .eq('device_id', deviceId);

  return !error;
}

export async function setActiveSession(deviceId: string, userId: string) {
  // Deactivate all
  await supabase
    .from('device_sessions')
    .update({ is_active: false })
    .eq('device_id', deviceId);

  // Activate target
  const { error } = await supabase
    .from('device_sessions')
    .update({ is_active: true, last_active_at: new Date().toISOString() })
    .eq('device_id', deviceId)
    .eq('user_id', userId);

  return !error;
}

// --- Auth Middleware Helper ---

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function extractDeviceId(body: any, request?: Request): string {
  // From body first, then from header
  if (body?.deviceId) return body.deviceId;
  if (request) {
    const headerDeviceId = request.headers.get('x-device-id');
    if (headerDeviceId) return headerDeviceId;
  }
  return '';
}

export function getUserProfile(user: any, businessProfile?: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    avatarUrl: user.avatar_url,
    role: user.role,
    travellerType: user.role === 'traveller' ? user.traveller_type : undefined,
    businessProfile: businessProfile ? {
      businessType: businessProfile.business_type,
      businessName: businessProfile.business_name,
      registrationNumber: businessProfile.registration_number,
      phone: businessProfile.phone,
      address: businessProfile.address,
      websiteUrl: businessProfile.website_url,
      bookingModel: businessProfile.booking_model,
    } : undefined,
  };
}
