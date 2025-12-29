'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionStatus = 'inactive' | 'trialing' | 'active' | 'canceled' | 'past_due';
export type PlanType = 'free' | 'pro';

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: PlanType;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isPro: boolean;
  isTrialing: boolean;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  createCheckoutSession: (priceId?: string) => Promise<string | null>;
  createPortalSession: () => Promise<string | null>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const defaultSubscription: Subscription = {
  id: '',
  status: 'inactive',
  plan: 'free',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      if (data) {
        setSubscription({
          id: data.id,
          status: data.status as SubscriptionStatus,
          plan: data.plan as PlanType,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
          trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
          currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        });
      } else {
        setSubscription({ ...defaultSubscription, id: user.id });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription({ ...defaultSubscription, id: user?.id || '' });
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createCheckoutSession = async (priceId?: string): Promise<string | null> => {
    if (!user) {
      console.error('User must be logged in to create checkout session');
      return null;
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  };

  const createPortalSession = async (): Promise<string | null> => {
    if (!user || !subscription?.stripeCustomerId) {
      console.error('User must be logged in with a subscription');
      return null;
    }

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription.stripeCustomerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      return data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      return null;
    }
  };

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isPro,
        isTrialing,
        showPaywall,
        setShowPaywall,
        createCheckoutSession,
        createPortalSession,
        refreshSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Backwards compatibility - maps to new subscription system
export function usePremium() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a SubscriptionProvider');
  }

  return {
    isPremium: context.isPro,
    showPaywall: context.showPaywall,
    setShowPaywall: context.setShowPaywall,
    upgradeToPremium: async () => {
      const url = await context.createCheckoutSession();
      if (url) {
        window.location.href = url;
      }
    },
  };
}
