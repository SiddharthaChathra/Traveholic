import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      role, // 'traveller' or 'business'
      username,
      email,
      password,
      fullName,
      phone, // optional for travellers, required for business
      // Traveller specific
      travellerType = 'normal', // 'normal' or 'vlogger'
      // Business specific
      businessType, // 'agency' or 'hotel'
      businessName,
      registrationNumber,
      address,
      websiteUrl,
      bookingModel, // 'direct' or 'redirect'
    } = body;

    // Validate common inputs
    if (!role || !username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required signup fields' },
        { status: 400 }
      );
    }

    if (role !== 'traveller' && role !== 'business') {
      return NextResponse.json(
        { error: 'Invalid account role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username.trim().toLowerCase()},email.eq.${email.trim().toLowerCase()}`)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already registered' },
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
        // Insert standard traveller
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
        // Validate business inputs
        if (!businessType || !businessName || !registrationNumber || !phone || !address || !bookingModel) {
          throw new Error('Missing business-specific profile information');
        }

        if (businessType !== 'agency' && businessType !== 'hotel') {
          throw new Error('Invalid business type');
        }

        if (bookingModel !== 'direct' && bookingModel !== 'redirect') {
          throw new Error('Invalid booking model');
        }

        // Insert business credentials into user table
        const { error: userInsertError } = await supabase.from('users').insert({
          id: userId,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password_hash: passwordHash,
          full_name: fullName.trim(),
          role: 'business'
        });
        
        if (userInsertError) throw userInsertError;

        // Insert business profile details
        const profileId = crypto.randomUUID();
        const { error: profileInsertError } = await supabase.from('business_profiles').insert({
          id: profileId,
          user_id: userId,
          business_type: businessType,
          business_name: businessName.trim(),
          registration_number: registrationNumber.trim(),
          phone: phone.trim(),
          address: address.trim(),
          website_url: websiteUrl ? websiteUrl.trim() : null,
          booking_model: bookingModel
        });

        if (profileInsertError) {
            // If profile fails, manual rollback of user
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

    // Generate JWT token
    const token = jwt.sign(
      { userId, username, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
      }
    });

    // Set cookie for HTTP session persistence
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
