'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();

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
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full">
            Free
          </span>
        </div>
        <p className="text-zinc-400 mb-4">
          You&apos;re on the free plan. Upgrade to Pro for unlimited documents and premium features.
        </p>
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-500/20"
        >
          Upgrade to Pro
        </Link>
      </div>

      {/* Danger zone */}
      <div className="bg-[#0f0f0f] rounded-xl border border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h2>
        <p className="text-zinc-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 border border-red-800 text-red-500 font-medium rounded-lg hover:bg-red-900/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
