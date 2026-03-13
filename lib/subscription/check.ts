import { createClient } from '@supabase/supabase-js';

const FREE_TIER_MONTHLY_LIMIT = 3;

export interface SubscriptionCheck {
  isPro: boolean;
  plan: 'free' | 'pro';
  status: string;
}

export interface DocumentLimitCheck {
  allowed: boolean;
  documentsUsed: number;
  documentsLimit: number;
  isPro: boolean;
  resetDate: string; // ISO date string of when the count resets
}

/**
 * Check if a user has an active pro subscription (server-side).
 */
export async function checkSubscription(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<SubscriptionCheck> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { isPro: false, plan: 'free', status: 'inactive' };
  }

  const isPro = data.status === 'active' || data.status === 'trialing';

  return {
    isPro,
    plan: isPro ? 'pro' : 'free',
    status: data.status,
  };
}

/**
 * Get the start of the current calendar month in UTC.
 */
function getMonthStart(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/**
 * Get the start of the next calendar month in UTC (reset date).
 */
function getNextMonthStart(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

/**
 * Check if a free user has reached their monthly document limit.
 * Pro users have unlimited documents.
 */
export async function checkDocumentLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<DocumentLimitCheck> {
  // First check subscription status
  const sub = await checkSubscription(supabase, userId);

  if (sub.isPro) {
    return {
      allowed: true,
      documentsUsed: 0,
      documentsLimit: -1, // -1 means unlimited
      isPro: true,
      resetDate: '',
    };
  }

  // Count documents created this month
  const monthStart = getMonthStart();
  const { count, error } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart);

  if (error) {
    console.error('Error checking document limit:', error);
    // Fail open — allow the upload but log the error
    return {
      allowed: true,
      documentsUsed: 0,
      documentsLimit: FREE_TIER_MONTHLY_LIMIT,
      isPro: false,
      resetDate: getNextMonthStart(),
    };
  }

  const documentsUsed = count || 0;

  return {
    allowed: documentsUsed < FREE_TIER_MONTHLY_LIMIT,
    documentsUsed,
    documentsLimit: FREE_TIER_MONTHLY_LIMIT,
    isPro: false,
    resetDate: getNextMonthStart(),
  };
}
