import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  verifyAccessToken,
  extractTokenFromRequest,
  removeDeviceSession,
  getSavedAccountsForDevice,
  generateAccessToken,
  generateRefreshToken,
  createOrUpdateDeviceSession,
  getUserProfile,
} from '@/lib/session';

// POST /api/auth/logout — Logout current active account only
export async function POST(request: NextRequest) {
  try {
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
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    const activeUserId = decoded.userId;

    // Remove active session from device
    await removeDeviceSession(deviceId, activeUserId);

    // Check remaining accounts
    const remainingAccounts = await getSavedAccountsForDevice(deviceId);

    let newActiveUser = null;
    let newAccessToken = null;
    let newRefreshToken = null;

    if (remainingAccounts.length > 0) {
      const nextAccount = remainingAccounts[0] as any;
      
      const { data: nextUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', nextAccount.userId)
        .single();

      if (nextUser) {
        let businessProfile = null;
        if (nextUser.role === 'business') {
          const { data: profile } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', nextUser.id)
            .single();
          businessProfile = profile;
        }

        newAccessToken = generateAccessToken({
          id: nextUser.id,
          username: nextUser.username,
          email: nextUser.email,
          role: nextUser.role,
        });
        newRefreshToken = generateRefreshToken();

        await createOrUpdateDeviceSession({
          deviceId,
          userId: nextUser.id,
          refreshToken: newRefreshToken,
          setActive: true,
        });

        newActiveUser = getUserProfile(nextUser, businessProfile);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      remainingAccounts,
      newActiveUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    if (newAccessToken) {
      response.cookies.set({
        name: 'travora_session',
        value: newAccessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
    } else {
      response.cookies.delete('travora_session');
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
