import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const lessonId = searchParams.get('lessonId');

  if (!userId || !lessonId) {
    return NextResponse.json({ status: 'error', message: 'Missing parameters' }, { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await supabase
        .from('lms_user_notes')
        .select('content')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      return NextResponse.json({ status: 'success', content: data?.content || '' });
    }

    return NextResponse.json({ status: 'success', content: '' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, lessonId, content } = await request.json();

    if (!userId || !lessonId) {
      return NextResponse.json({ status: 'error', message: 'Missing parameters' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from('lms_user_notes').upsert({
        user_id: userId,
        lesson_id: lessonId,
        content: content,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
