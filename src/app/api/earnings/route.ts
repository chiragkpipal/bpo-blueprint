import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ status: 'error', message: 'Missing userId' }, { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('lms_user_earnings')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        // Fallback gracefully if table not created yet
        console.error('lms_user_earnings error:', error);
        return NextResponse.json({ status: 'success', earnings: [], totalZar: 0 });
      }

      const earnings = data || [];
      const totalZar = earnings.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

      return NextResponse.json({
        status: 'success',
        earnings,
        totalZar,
      });
    }

    return NextResponse.json({ status: 'success', earnings: [], totalZar: 0 });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, userId, amount, currency = 'ZAR', date, clientName, serviceType, notes } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const payload = {
        user_id: userId,
        amount: Number(amount),
        currency: currency || 'ZAR',
        date: date || new Date().toISOString().split('T')[0],
        client_name: clientName?.trim() || null,
        service_type: serviceType?.trim() || null,
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { data, error } = await supabase
          .from('lms_user_earnings')
          .update(payload)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ status: 'success', earning: data });
      } else {
        const { data, error } = await supabase
          .from('lms_user_earnings')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ status: 'success', earning: data });
      }
    }

    return NextResponse.json({
      status: 'success',
      earning: {
        id: id || `local-${Date.now()}`,
        user_id: userId,
        amount: Number(amount),
        currency,
        date: date || new Date().toISOString().split('T')[0],
        client_name: clientName,
        service_type: serviceType,
        notes,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ status: 'error', message: 'Missing parameters' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error } = await supabase
        .from('lms_user_earnings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
