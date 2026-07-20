import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  createOrUpdateDeviceSession,
  getUserProfile,
} from '@/lib/session';

// POST /api/auth/refresh — Refresh an access token using a refresh token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, refreshToken, userId } = body;

    if (!deviceId || !refreshToken || !userId) {
      return NextResponse.json(
        { error: 'deviceId, refreshToken, and userId are required' },
        { status: 400 }
      );
    }

    // Find the device session
    const { data: session } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('user_id', userId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'SESSION_NOT_FOUND', message: 'No session found for this device and account.' },
        { status: 404 }
      );
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'SESSION_EXPIRED', message: 'Refresh token has expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Verify refresh token matches stored hash
    const providedHash = hashRefreshToken(refreshToken);
    if (providedHash !== session.refresh_token_hash) {
      return NextResponse.json(
        { error: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid. This may indicate a security issue.' },
        { status: 401 }
      );
    }

    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch business profile if applicable
    let businessProfile = null;
    if (user.role === 'business') {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      businessProfile = profile;
    }

    // Generate new tokens (rotate)
    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken();

    // Update session with rotated refresh token
    await createOrUpdateDeviceSession({
      deviceId,
      userId: user.id,
      refreshToken: newRefreshToken,
      setActive: session.is_active, // preserve active state
    });

    const userProfile = getUserProfile(user, businessProfile);

    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      user: userProfile,
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Update cookie if this is the active session
    if (session.is_active) {
      response.cookies.set({
        name: 'travora_session',
        value: newAccessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
