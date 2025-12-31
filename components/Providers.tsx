'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { DocumentProvider } from '@/contexts/DocumentContext';
import PaywallModal from './PaywallModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <DocumentProvider>
          {children}
          <PaywallModal />
        </DocumentProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
