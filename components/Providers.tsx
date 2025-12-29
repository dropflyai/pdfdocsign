'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import PaywallModal from './PaywallModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        {children}
        <PaywallModal />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
