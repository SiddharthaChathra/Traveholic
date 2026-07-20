import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';
import {
  generateAccessToken,
  generateRefreshToken,
  createOrUpdateDeviceSession,
  getUserProfile,
  extractDeviceId,
} from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inputs using Zod
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { identifier, password } = validationResult.data;
    const deviceId = extractDeviceId(body, request);

    // Query user by username or email
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier.trim().toLowerCase()},email.eq.${identifier.trim().toLowerCase()}`)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Fetch business profile if user is business type
    let businessProfile = null;
    if (user.role === 'business') {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      businessProfile = profile;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken();

    // Create device session if deviceId is provided
    if (deviceId) {
      const userAgent = request.headers.get('user-agent') || undefined;
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
      
      await createOrUpdateDeviceSession({
        deviceId,
        userId: user.id,
        refreshToken,
        userAgent,
        ipAddress: ip,
        setActive: true,
      });
    }

    const userProfile = getUserProfile(user, businessProfile);

    // Create success response
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: userProfile,
      token: accessToken, // backward compat
      accessToken,
      refreshToken: deviceId ? refreshToken : undefined,
    });

    // Set cookie for backward compatibility
    response.cookies.set({
      name: 'travora_session',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
