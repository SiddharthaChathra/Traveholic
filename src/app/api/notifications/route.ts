import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travora_session')?.value;

    if (!token) {
      return NextResponse.json({ success: true, notifications: [] }); // Or 401
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: true, notifications: [] }); // Or 401
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    // Map to frontend expected format (Needs author info, skipping join for speed/simplicity, using basic mock names if actor not found)
    const actorIds = [...new Set(notifications.map(n => n.actor_id))];
    const { data: usersData } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);

    const usersMap: Record<string, any> = {};
    if (usersData) {
      usersData.forEach(u => {
        usersMap[u.id] = {
          name: u.full_name || u.username,
          avatar: u.avatar_url || 'https://via.placeholder.com/40'
        };
      });
    }

    const mappedNotifications = notifications.map(notif => {
      const actor = usersMap[notif.actor_id] || { name: 'Someone', avatar: 'https://via.placeholder.com/40' };
      
      let content = notif.message || '';
      if (!content) {
        if (notif.type === 'like') content = 'liked your post';
        if (notif.type === 'comment') content = 'commented on your post';
        if (notif.type === 'follow') content = 'started following you';
      }

      return {
        id: notif.id,
        user: actor.name,
        avatar: actor.avatar,
        action: content,
        time: calculateTimeAgo(notif.created_at),
        unread: !notif.read
      };
    });

    return NextResponse.json({ success: true, notifications: mappedNotifications });
  } catch (error: any) {
    console.error('Notifications Error:', error);
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
