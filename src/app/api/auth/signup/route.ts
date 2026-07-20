import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signupSchema } from '@/lib/validations';
import {
  generateAccessToken,
  generateRefreshToken,
  createOrUpdateDeviceSession,
  extractDeviceId,
} from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inputs using Zod
    const validationResult = signupSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const {
      role,
      username,
      email,
      password,
      fullName,
      phone,
      travellerType,
      businessProfile,
    } = validationResult.data;

    const deviceId = extractDeviceId(body, request);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username.trim().toLowerCase()},email.eq.${email.trim().toLowerCase()}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email or username is already in use. Note: If you already have a Traveller account and are trying to create a Venture account (or vice versa), you must use a different, unique email.' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique ID
    const userId = crypto.randomUUID();

    try {
      if (role === 'traveller') {
        const { error: insertError } = await supabase.from('users').insert({
          id: userId,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password_hash: passwordHash,
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : null,
          role: 'traveller',
          traveller_type: travellerType
        });

        if (insertError) throw insertError;
      } else {
        const { error: userInsertError } = await supabase.from('users').insert({
          id: userId,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password_hash: passwordHash,
          full_name: fullName.trim(),
          role: 'business'
        });
        
        if (userInsertError) throw userInsertError;

        const profileId = crypto.randomUUID();
        const { error: profileInsertError } = await supabase.from('business_profiles').insert({
          id: profileId,
          user_id: userId,
          business_type: businessProfile!.businessType,
          business_name: businessProfile!.businessName.trim(),
          registration_number: businessProfile!.registrationNumber.trim(),
          phone: businessProfile!.phone.trim(),
          address: businessProfile!.address.trim(),
          website_url: businessProfile!.websiteUrl ? businessProfile!.websiteUrl.trim() : null,
          booking_model: businessProfile!.bookingModel
        });

        if (profileInsertError) {
          await supabase.from('users').delete().eq('id', userId);
          throw profileInsertError;
        }
      }
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || 'Database error occurred during signup' },
        { status: 500 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: userId, username, email, role });
    const refreshToken = generateRefreshToken();

    // Create device session if deviceId is provided
    if (deviceId) {
      const userAgent = request.headers.get('user-agent') || undefined;
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
      
      await createOrUpdateDeviceSession({
        deviceId,
        userId,
        refreshToken,
        userAgent,
        ipAddress: ip,
        setActive: true,
      });
    }

    // Return success
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        username,
        email,
        fullName,
        role,
        travellerType: role === 'traveller' ? travellerType : undefined
      },
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
