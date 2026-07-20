import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createPostSchema } from '@/lib/validations';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travora_session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
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

    const body = await req.json();
    
    // Validate inputs using Zod
    const validationResult = createPostSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { caption, location, images, tags } = validationResult.data;

    // Parse images if it's a stringified JSON array
    let mediaUrls = images;
    if (typeof images === 'string') {
      try {
        mediaUrls = JSON.parse(images);
      } catch (e) {
        mediaUrls = [images];
      }
    }

    // Insert post into Supabase
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content: caption || '', // Default to empty string if undefined
        location: location || 'Travel Heaven',
        media_urls: mediaUrls || [],
        tags: tags || [],
        author_id: decoded.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Post Insert Error:', error);
      return NextResponse.json(
        { error: 'Failed to create post in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        caption: post.content,
        location: post.location,
        mediaUrls: post.media_urls,
        createdAt: post.created_at,
        tags: post.tags,
        authorId: post.author_id
      }
    });
    
  } catch (error: any) {
    console.error('Create Post Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error occurred while creating post' },
      { status: 500 }
    );
  }
}
