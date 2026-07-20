import { NextResponse, NextRequest } from 'next/server';
import {
  verifyAccessToken,
  extractTokenFromRequest,
  removeAllDeviceSessions,
} from '@/lib/session';

// POST /api/auth/logout-all — Logout all accounts on this device
export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: 'Access token expired or invalid' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // Delete all sessions for this device
    const success = await removeAllDeviceSessions(deviceId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove all sessions' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'All accounts logged out from this device',
    });

    // Clear cookie
    response.cookies.delete('travora_session');

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
