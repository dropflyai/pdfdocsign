'use client';

import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function BillingPage() {
  const {
    subscription,
    isPro,
    isTrialing,
    setShowPaywall,
    createCheckoutSession,
    createPortalSession
  } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const url = await createCheckoutSession();
      if (url) {
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const url = await createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Billing</h1>

      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            isPro
              ? isTrialing
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isPro ? (isTrialing ? 'Pro (Trial)' : 'Pro') : 'Free'}
          </span>
        </div>

        {isPro ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Monthly price</span>
              <span className="font-semibold">$9.99/month</span>
            </div>
            {isTrialing && subscription?.trialEndsAt && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Trial ends</span>
                <span className="font-semibold">{formatDate(subscription.trialEndsAt)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Next billing date</span>
              <span className="font-semibold">{formatDate(subscription?.currentPeriodEnd || null)}</span>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Manage subscription'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Upgrade to Pro to unlock all features including unlimited documents,
              send for signature, cloud storage, and more.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Upgrade to Pro - $9.99/month'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              7-day free trial included
            </p>
          </div>
        )}
      </div>

      {/* Pro features */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Pro Features</h3>
        <ul className="space-y-3">
          {[
            'Unlimited documents',
            'Send for signature',
            'Scan & create PDFs',
            'Cloud storage',
            'Template library',
            'Remove watermarks',
            'Priority support',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
