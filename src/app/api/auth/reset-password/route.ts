import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP' },
        { status: 400 }
      );
    }

    // Verify OTP
    const { data: resetRecord } = await supabase
      .from('password_resets')
      .select('*')
      .eq('user_id', user.id)
      .eq('token', otp)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id);

    // Delete the used token
    await supabase
      .from('password_resets')
      .delete()
      .eq('token', otp);

    return NextResponse.json({
      success: true,
      message: 'Password successfully reset.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
