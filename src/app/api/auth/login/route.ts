import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be username or email

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier and password are required' },
        { status: 400 }
      );
    }

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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create success response
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        travellerType: user.role === 'traveller' ? user.traveller_type : undefined,
        businessProfile: businessProfile ? {
          businessType: businessProfile.business_type,
          businessName: businessProfile.business_name,
          registrationNumber: businessProfile.registration_number,
          phone: businessProfile.phone,
          address: businessProfile.address,
          websiteUrl: businessProfile.website_url,
          bookingModel: businessProfile.booking_model
        } : undefined
      }
    });

    // Set cookie
    response.cookies.set({
      name: 'travora_session',
      value: token,
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
