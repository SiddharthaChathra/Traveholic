import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Fetch posts ordered by newest
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, feed: [], nextCursor: null });
    }

    // Extract unique author IDs
    const authorIds = [...new Set(posts.map(p => p.author_id))];

    // Fetch authors from public.users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, role, traveller_type')
      .in('id', authorIds);

    const usersMap: Record<string, any> = {};
    if (!usersError && usersData) {
      usersData.forEach(u => {
        usersMap[u.id] = {
          name: u.full_name || u.username,
          username: u.username,
          avatar: u.avatar_url || 'https://via.placeholder.com/40',
          role: u.role,
          travellerType: u.traveller_type
        };
      });
    }

    // Fetch likes and comments counts (optional for now, let's keep it simple)
    // Map to frontend expected format
    const feed = posts.map(post => {
      const author = usersMap[post.author_id] || {
        name: 'Unknown User',
        username: 'unknown',
        avatar: 'https://via.placeholder.com/40'
      };

      // Safely parse mediaUrls
      let mediaUrls = [];
      if (Array.isArray(post.media_urls)) {
        mediaUrls = post.media_urls;
      } else if (typeof post.media_urls === 'string') {
        try { mediaUrls = JSON.parse(post.media_urls); } catch(e) {}
      }

      return {
        id: post.id,
        user: author,
        location: post.location || '',
        images: mediaUrls,
        caption: post.content || '',
        likes: post.likes_count || 0,
        comments: [], // Comments can be fetched separately or populated later
        timeAgo: calculateTimeAgo(post.created_at)
      };
    });

    const nextCursor = posts.length === limit ? posts[posts.length - 1].created_at : null;

    return NextResponse.json({ success: true, feed, nextCursor });
  } catch (error: any) {
    console.error('Feed Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function calculateTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
