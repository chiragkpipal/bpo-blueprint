import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, paymentId, sandbox } = await request.json();

    if (!email) {
      return NextResponse.json({ status: 'error', message: 'Email required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const cleanEmail = email.trim().toLowerCase();

      // Find user
      const { data: user, error } = await supabase
        .from('lms_users')
        .select('id, email, status, full_name')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (user) {
        // Activate access
        await supabase
          .from('lms_users')
          .update({
            status: 'active',
            payment_session_id: paymentId || user.id,
            purchased_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        console.log(`[BLUEPRINT LMS] Confirmed & activated access for ${cleanEmail} (Payment ID: ${paymentId})`);

        return NextResponse.json({
          status: 'success',
          message: 'Access confirmed and activated.',
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            status: 'active'
          }
        });
      }
    }

    return NextResponse.json({ status: 'success', message: 'Processed' });
  } catch (err: any) {
    console.error('Error confirming payment:', err);
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
