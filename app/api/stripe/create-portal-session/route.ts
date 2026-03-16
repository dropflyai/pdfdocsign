import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logRateLimited } from '@/lib/security/audit-log';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`portal:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'billing-portal');
      return rateLimitResult.error!;
    }

    // SECURITY: Verify the user is authenticated
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    // Get the user's Stripe customer ID from database - don't trust client-provided values
    const { data: subscription, error: dbError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user!.id)
      .single();

    if (dbError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
