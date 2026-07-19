import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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

    const db = await getDb();

    // Verify user exists
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or OTP' },
        { status: 400 }
      );
    }

    // Verify OTP
    const resetRecord = await db.get(
      'SELECT * FROM password_resets WHERE user_id = ? AND token = ? AND expires_at > CURRENT_TIMESTAMP',
      [user.id, otp]
    );

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
    await db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Delete the used token
    await db.run('DELETE FROM password_resets WHERE token = ?', [otp]);

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
