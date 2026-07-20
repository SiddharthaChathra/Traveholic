import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  verifyAccessToken,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getDeviceSession,
  createOrUpdateDeviceSession,
  setActiveSession,
  extractTokenFromRequest,
  getUserProfile,
} from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Verify the caller is authenticated (current active account)
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: 'Access token expired or invalid' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId, targetUserId } = body;

    if (!deviceId || !targetUserId) {
      return NextResponse.json(
        { error: 'deviceId and targetUserId are required' },
        { status: 400 }
      );
    }

    // Find the device session for the target user
    const session = await getDeviceSession(deviceId, targetUserId);
    if (!session) {
      return NextResponse.json(
        { error: 'ACCOUNT_NOT_FOUND', message: 'This account is not saved on this device. Please log in first.' },
        { status: 404 }
      );
    }

    // Check if refresh token has expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'SESSION_EXPIRED', message: 'Session for this account has expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Fetch the target user's profile
    const { data: targetUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch business profile if applicable
    let businessProfile = null;
    if (targetUser.role === 'business') {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', targetUser.id)
        .single();
      businessProfile = profile;
    }

    // Generate new tokens for the target account
    const newAccessToken = generateAccessToken({
      id: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role,
    });
    const newRefreshToken = generateRefreshToken();

    // Rotate refresh token and set as active
    await createOrUpdateDeviceSession({
      deviceId,
      userId: targetUserId,
      refreshToken: newRefreshToken,
      setActive: true,
    });

    const userProfile = getUserProfile(targetUser, businessProfile);

    const response = NextResponse.json({
      success: true,
      message: `Switched to @${targetUser.username}`,
      user: userProfile,
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Update cookie to new active account
    response.cookies.set({
      name: 'travora_session',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
