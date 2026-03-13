'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { subscription, isPro, isTrialing, loading: subLoading, createPortalSession } = useSubscription();
  const [deleting, setDeleting] = useState(false);

  const planLabel = isPro
    ? isTrialing ? 'Pro (Trial)' : 'Pro'
    : 'Free';

  const planBadgeClasses = isPro
    ? 'bg-purple-600/20 text-purple-400'
    : 'bg-zinc-800 text-zinc-300';

  const handleManageSubscription = async () => {
    const url = await createPortalSession();
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Account section */}
      <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-1">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-1">Name</label>
            <p className="text-white">{user?.user_metadata?.full_name || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Subscription section */}
      <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Subscription</h2>
          {subLoading ? (
            <span className="px-3 py-1 bg-zinc-800 text-zinc-500 text-sm font-medium rounded-full animate-pulse">
              Loading...
            </span>
          ) : (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${planBadgeClasses}`}>
              {planLabel}
            </span>
          )}
        </div>
        {isPro ? (
          <>
            <p className="text-zinc-400 mb-2">
              You&apos;re on the <strong className="text-white">Pro</strong> plan.
              {isTrialing && ' Your trial is currently active.'}
              {subscription?.currentPeriodEnd && (
                <> Current period ends on{' '}
                  <span className="text-white">
                    {subscription.currentPeriodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>.
                </>
              )}
            </p>
            {subscription?.stripeCustomerId && (
              <button
                onClick={handleManageSubscription}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white font-semibold rounded-lg hover:bg-zinc-700 transition-all"
              >
                Manage Subscription
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-zinc-400 mb-4">
              You&apos;re on the free plan. Upgrade to Pro for unlimited documents and premium features.
            </p>
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-500/20"
            >
              Upgrade to Pro
            </Link>
          </>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-[#0f0f0f] rounded-xl border border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h2>
        <p className="text-zinc-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          disabled={deleting}
          onClick={async () => {
            const confirmed = window.confirm(
              'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
            );
            if (!confirmed) return;

            const doubleConfirmed = window.confirm(
              'This is your last chance. All documents, signatures, and account data will be permanently deleted. Continue?'
            );
            if (!doubleConfirmed) return;

            setDeleting(true);
            try {
              const supabase = createClient();
              const { error } = await supabase.rpc('delete_user_account');
              if (error) {
                alert('Failed to delete account. Please contact support.');
                setDeleting(false);
                return;
              }
              await signOut();
            } catch {
              alert('Failed to delete account. Please contact support.');
              setDeleting(false);
            }
          }}
          className="px-4 py-2 border border-red-800 text-red-500 font-medium rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}
