import { NextResponse, NextRequest } from 'next/server';
import {
  verifyAccessToken,
  extractTokenFromRequest,
  getSavedAccountsForDevice,
} from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    // Verify the caller is authenticated
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: 'Access token expired or invalid' }, { status: 401 });
    }

    // Get deviceId from query params
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId query parameter is required' },
        { status: 400 }
      );
    }

    const accounts = await getSavedAccountsForDevice(deviceId);

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
