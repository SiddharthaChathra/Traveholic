import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> | { name: string } }) {
  try {
    const { name } = await params;
    
    // In the future, we will fetch from Supabase destinations table here
    // For now, since the Supabase table isn't fully migrated yet,
    // we return an error so the frontend gracefully falls back to its local data.
    return NextResponse.json(
      { error: 'Destination not found in database, use fallback' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
