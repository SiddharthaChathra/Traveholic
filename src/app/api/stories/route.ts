import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }

    if (!stories || stories.length === 0) {
      return NextResponse.json({ success: true, stories: [] });
    }

    const authorIds = [...new Set(stories.map(s => s.user_id))];

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, is_verified')
      .in('id', authorIds);

    const usersMap: Record<string, any> = {};
    if (!usersError && usersData) {
      usersData.forEach(u => {
        usersMap[u.id] = {
          name: u.full_name || u.username,
          username: u.username,
          avatar: u.avatar_url || 'https://via.placeholder.com/40',
          isVerified: u.is_verified || false
        };
      });
    }

    // Group stories by user for the frontend format
    // Frontend expects: { id: "user_id", username: "name", avatar: "url", hasUnseen: true, items: [...] }
    const groupedStories: Record<string, any> = {};

    stories.forEach(story => {
      if (!groupedStories[story.user_id]) {
        groupedStories[story.user_id] = {
          id: story.user_id,
          username: usersMap[story.user_id]?.name || 'Unknown',
          avatar: usersMap[story.user_id]?.avatar || 'https://via.placeholder.com/40',
          isVerified: usersMap[story.user_id]?.isVerified || false,
          hasUnseen: true, // We don't track seen status yet in Supabase
          items: []
        };
      }
      
      groupedStories[story.user_id].items.push({
        id: story.id,
        imageUrl: story.image_url,
        timestamp: story.created_at,
        caption: story.caption
      });
    });

    const finalStories = Object.values(groupedStories);

    return NextResponse.json({ success: true, stories: finalStories });
  } catch (error: any) {
    console.error('Stories Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
