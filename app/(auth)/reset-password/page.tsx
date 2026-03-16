export const dynamic = 'force-dynamic';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Set New Password - PDF Doc Sign',
  description: 'Set your new PDF Doc Sign password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
