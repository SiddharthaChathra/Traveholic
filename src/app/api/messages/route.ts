import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createMessageSchema } from '@/lib/validations';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travora_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try { decoded = jwt.verify(token, JWT_SECRET); } 
    catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const searchParams = req.nextUrl.searchParams;
    let receiverId = searchParams.get('receiverId'); // Actually receiverUsername

    if (!receiverId) {
      return NextResponse.json({ success: true, messages: [] });
    }

    // Lookup receiver UUID by username
    const { data: receiverData } = await supabase
      .from('users')
      .select('id')
      .eq('username', receiverId)
      .single();

    if (!receiverData) {
      return NextResponse.json({ success: true, messages: [] });
    }
    const receiverUuid = receiverData.id;
    const senderUuid = decoded.userId;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${senderUuid},receiver_id.eq.${receiverUuid}),and(sender_id.eq.${receiverUuid},receiver_id.eq.${senderUuid})`)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Messages fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const formatted = (messages || []).map(m => ({
      id: m.id,
      text: m.text,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      timestamp: m.timestamp,
      isRead: m.is_read
    }));

    return NextResponse.json({ success: true, messages: formatted });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travora_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try { decoded = jwt.verify(token, JWT_SECRET); } 
    catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const body = await req.json();
    
    // Validate inputs using Zod
    const validationResult = createMessageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { receiverId, text } = validationResult.data; // receiverId is actually receiverUsername

    // Lookup receiver UUID by username
    const { data: receiverData } = await supabase
      .from('users')
      .select('id')
      .eq('username', receiverId)
      .single();

    if (!receiverData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const receiverUuid = receiverData.id;

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: decoded.userId,
        receiver_id: receiverUuid,
        text: text
      })
      .select()
      .single();

    if (error) {
      console.error('Message insert error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: {
        id: message.id,
        text: message.text,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        timestamp: message.timestamp,
        isRead: message.is_read
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
