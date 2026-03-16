export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In - PDF Doc Sign',
  description: 'Sign in to your PDF Doc Sign account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-2xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
