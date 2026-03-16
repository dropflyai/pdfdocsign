export const dynamic = 'force-dynamic';

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Reset Password - PDF Doc Sign',
  description: 'Reset your PDF Doc Sign password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
