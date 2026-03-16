import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { logSubscriptionEvent } from '@/lib/security/audit-log';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as { subscription?: string | null }).subscription;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await handleSubscriptionChange(subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        if (process.env.NODE_ENV === 'development') {
          console.log(`Unhandled event type: ${event.type}`);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    // Try to find user by customer ID
    const { data } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!data?.user_id) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }
  }

  const status = mapStripeStatus(subscription.status);
  const plan = subscription.items.data[0]?.price?.id ? 'pro' : 'free';

  // Access properties with type assertion for compatibility
  const sub = subscription as unknown as {
    trial_end?: number | null;
    current_period_end: number;
  };

  await getSupabaseAdmin()
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status,
      plan,
      trial_ends_at: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      current_period_end: new Date(
        sub.current_period_end * 1000
      ).toISOString(),
    });

  // Audit log the subscription event
  if (userId) {
    const eventType = subscription.status === 'trialing'
      ? 'subscription.trial_started'
      : 'subscription.updated';
    await logSubscriptionEvent(
      eventType,
      userId,
      subscription.id,
      { status, plan, stripe_status: subscription.status }
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Get user_id before updating
  const { data: existingSub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan: 'free',
      stripe_subscription_id: null,
    })
    .eq('stripe_customer_id', customerId);

  // Audit log cancellation
  if (existingSub?.user_id) {
    await logSubscriptionEvent(
      'subscription.canceled',
      existingSub.user_id,
      subscription.id,
      { reason: 'subscription_deleted' }
    );
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_customer_id', customerId);
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): string {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    default:
      return 'inactive';
  }
}
