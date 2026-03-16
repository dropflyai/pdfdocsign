export const dynamic = 'force-dynamic';

import SignupForm from '@/components/auth/SignupForm';

export const metadata = {
  title: 'Start Free Trial - PDF Doc Sign',
  description: 'Sign up for PDF Doc Sign and get 7 days free',
};

export default function SignupPage() {
  return <SignupForm />;
}
