import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travora_session')?.value;

    let userId = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {}
    }

    let query = supabase
      .from('users')
      .select('id, username, full_name, avatar_url, role, traveller_type')
      .limit(5);

    if (userId) {
      query = query.neq('id', userId);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions = users.map(u => ({
      id: u.id,
      name: u.full_name || u.username,
      username: u.username,
      avatar: u.avatar_url || 'https://via.placeholder.com/40',
      role: u.role,
      travellerType: u.traveller_type,
      mutualConnections: Math.floor(Math.random() * 10) // mock for now
    }));

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Suggestions Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
