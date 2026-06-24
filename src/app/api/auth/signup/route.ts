import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username.trim().toLowerCase(), email.trim().toLowerCase()]
    );

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

    // Start transaction to ensure atomic inserts
    await db.run('BEGIN TRANSACTION');

    try {
      if (role === 'traveller') {
        // Insert standard traveller
        await db.run(
          `INSERT INTO users (id, username, email, password_hash, full_name, phone, role, traveller_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            username.trim().toLowerCase(),
            email.trim().toLowerCase(),
            passwordHash,
            fullName.trim(),
            phone ? phone.trim() : null,
            'traveller',
            travellerType
          ]
        );
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
        await db.run(
          `INSERT INTO users (id, username, email, password_hash, full_name, role)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            username.trim().toLowerCase(),
            email.trim().toLowerCase(),
            passwordHash,
            fullName.trim(),
            'business'
          ]
        );

        // Insert business profile details
        const profileId = crypto.randomUUID();
        await db.run(
          `INSERT INTO business_profiles (id, user_id, business_type, business_name, registration_number, phone, address, website_url, booking_model)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            profileId,
            userId,
            businessType,
            businessName.trim(),
            registrationNumber.trim(),
            phone.trim(),
            address.trim(),
            websiteUrl ? websiteUrl.trim() : null,
            bookingModel
          ]
        );
      }

      await db.run('COMMIT');
    } catch (err: any) {
      await db.run('ROLLBACK');
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
