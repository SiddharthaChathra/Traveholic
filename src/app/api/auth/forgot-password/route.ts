import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      // For security, don't reveal if user exists, just return success
      return NextResponse.json({ success: true, message: 'If an account exists with that email, a password reset link has been generated. Please check the console.' });
    }

    // Generate a 6-digit OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
    const id = crypto.randomUUID();

    // Save to database
    await supabase.from('password_resets').insert({
      id: id,
      user_id: user.id,
      token: otp,
      expires_at: expiresAt
    });

    // For development/testing: log OTP
    console.log('--- PASSWORD RESET OTP ---');
    console.log(`OTP for ${email}: ${otp}`);
    console.log('--------------------------');

    return NextResponse.json({
      success: true,
      message: 'OTP has been generated.',
      otp // Sending back for dev testing, simulating an email delivery
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
