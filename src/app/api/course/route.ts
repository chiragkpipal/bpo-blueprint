import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch modules exclusively for The BPO Blueprint Course
    const BLUEPRINT_COURSE_ID = 'b0b00000-0000-4000-a000-000000000001';
    let { data: modulesData, error: modErr } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', BLUEPRINT_COURSE_ID)
      .order('order_index', { ascending: true });

    // Fallback if course_id hasn't been set
    if (!modulesData || modulesData.length === 0) {
      const fallback = await supabase
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });
      modulesData = fallback.data;
    }

    if (modErr) {
      console.error('Error fetching modules:', modErr);
      return NextResponse.json({ status: 'error', message: modErr.message }, { status: 500 });
    }

    // 2. Fetch lessons
    const { data: lessonsData, error: lessErr } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index', { ascending: true });

    if (lessErr) {
      console.error('Error fetching lessons:', lessErr);
      return NextResponse.json({ status: 'error', message: lessErr.message }, { status: 500 });
    }

    // 3. Assemble modules with their nested lessons
    const chapters = (modulesData || []).map((mod: any) => {
      const moduleLessons = (lessonsData || [])
        .filter((l: any) => l.module_id === mod.id)
        .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((l: any) => ({
          id: l.id,
          title: l.title,
          description: l.description || '',
          videoUrl: l.video_url || '',
          duration: l.duration || '12 min',
          orderIndex: l.order_index ?? 0,
          attachments: l.attachments || []
        }));

      return {
        id: mod.id,
        title: mod.title,
        description: mod.description || '',
        orderIndex: mod.order_index ?? 0,
        lessons: moduleLessons
      };
    });

    return NextResponse.json({
      status: 'success',
      data: chapters
    });
  } catch (err: any) {
    console.error('Course fetch exception:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
