import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function GET() {
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

    const db = await getDb();

    // Fetch user details from database
    const user = await db.get(
      'SELECT id, username, email, full_name, phone, avatar_url, role, traveller_type FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch business profile if applicable
    let businessProfile = null;
    if (user.role === 'business') {
      businessProfile = await db.get(
        'SELECT * FROM business_profiles WHERE user_id = ?',
        [user.id]
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}

// DELETE method to logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Clear cookie
  response.cookies.delete('travora_session');

  return response;
}
