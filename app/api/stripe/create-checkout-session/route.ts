import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logRateLimited, logSubscriptionEvent } from '@/lib/security/audit-log';

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
    const rateLimitResult = checkRateLimit(`checkout:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'checkout');
      return rateLimitResult.error!;
    }

    // SECURITY: Verify the user is authenticated
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const { priceId } = await request.json();

    // Use authenticated user's ID and email - don't trust client-provided values
    const userId = user!.id;
    const email = user!.email;

    // Check if user already has a Stripe customer ID
    const { data: subscription } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create a new customer if one doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await getSupabaseAdmin()
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          status: 'inactive',
          plan: 'free',
        });
    }

    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_MONTHLY_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabase_user_id: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        supabase_user_id: userId,
      },
    });

    // Audit log checkout initiation
    await logSubscriptionEvent(
      'subscription.created',
      userId,
      session.id,
      { priceId: priceId || process.env.STRIPE_MONTHLY_PRICE_ID, checkout: true }
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
