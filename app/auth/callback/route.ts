import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// SECURITY: Whitelist of allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/settings',
  '/settings/billing',
  '/editor',
];

function isValidRedirect(path: string): boolean {
  // Must start with / (relative path only)
  if (!path.startsWith('/')) return false;

  // Must not contain protocol or double slashes (prevent //evil.com)
  if (path.includes('//') || path.includes(':')) return false;

  // Must be in whitelist or start with an allowed prefix
  return ALLOWED_REDIRECTS.some(
    allowed => path === allowed || path.startsWith(`${allowed}/`)
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // SECURITY: Validate redirect URL to prevent open redirect attacks
  const safeRedirect = isValidRedirect(next) ? next : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Use validated redirect path
      return NextResponse.redirect(`${origin}${safeRedirect}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
