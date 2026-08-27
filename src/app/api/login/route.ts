import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, password, paymentId, paymentSuccess, sandbox } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ status: 'error', message: 'Email and password required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = hashPassword(password);

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: user, error } = await supabase
        .from('lms_users')
        .select('id, email, full_name, status, password_hash')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error || !user) {
        return NextResponse.json({ status: 'error', message: 'User not found in LMS records.' }, { status: 404 });
      }

      if (user.password_hash !== passwordHash) {
        return NextResponse.json({ status: 'error', message: 'Incorrect password.' }, { status: 401 });
      }

      // If user status is pending, but returning from successful payment or sandbox, activate them now
      if (user.status !== 'active') {
        if (paymentId || paymentSuccess || sandbox || process.env.BLUEPRINT_PAYMENTS_TEST === 'true') {
          await supabase
            .from('lms_users')
            .update({
              status: 'active',
              payment_session_id: paymentId || user.id,
              purchased_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          user.status = 'active';
        } else {
          return NextResponse.json({
            status: 'error',
            message: 'Your payment is still pending confirmation or access has not been activated yet.'
          }, { status: 403 });
        }
      }

      return NextResponse.json({
        status: 'success',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          status: user.status
        }
      });
    }

    // Fallback mode for local dev testing
    return NextResponse.json({
      status: 'success',
      user: {
        id: 'dev-lms-user',
        email: cleanEmail,
        fullName: 'Blueprint Student',
        status: 'active'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
