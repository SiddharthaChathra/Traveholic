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

export async function DELETE(request: NextRequest) {
  try {
    // Verify the caller is authenticated
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

    // Remove the device session
    const removed = await removeDeviceSession(deviceId, targetUserId);
    if (!removed) {
      return NextResponse.json(
        { error: 'Failed to remove account from device' },
        { status: 500 }
      );
    }

    // Check if the removed account was the active one
    const wasActive = decoded.userId === targetUserId;

    // Get remaining accounts on this device
    const remainingAccounts = await getSavedAccountsForDevice(deviceId);

    // If the removed account was the active one, auto-switch to the next available
    let newActiveUser = null;
    let newAccessToken = null;
    let newRefreshToken = null;

    if (wasActive && remainingAccounts.length > 0) {
      const nextAccount = remainingAccounts[0] as any;
      
      // Fetch full user data
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
      message: 'Account removed from this device',
      remainingAccounts,
      newActiveUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Update cookie if we auto-switched
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
    } else if (wasActive) {
      // No accounts left, clear the cookie
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
