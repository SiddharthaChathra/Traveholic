import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travora_session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { travellerType } = body;

    if (!travellerType || (travellerType !== 'normal' && travellerType !== 'vlogger')) {
      return NextResponse.json(
        { error: 'Invalid traveller type. Must be "normal" or "vlogger"' },
        { status: 400 }
      );
    }

    // Verify user exists and is a traveller
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'traveller') {
      return NextResponse.json(
        { error: 'Only traveller accounts can update traveller type' },
        { status: 400 }
      );
    }

    // Update user record
    await supabase
      .from('users')
      .update({ traveller_type: travellerType })
      .eq('id', decoded.userId);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      travellerType
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
