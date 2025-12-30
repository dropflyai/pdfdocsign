import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

/**
 * Verify the authenticated user from the request.
 * Returns the user if authenticated, or an error response if not.
 */
export async function verifyAuthenticatedUser(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized - Please log in' },
          { status: 401 }
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
      },
      error: null,
    };
  } catch {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Verify that the authenticated user matches the requested userId.
 * Prevents users from accessing other users' data.
 */
export async function verifyUserOwnership(requestedUserId: string): Promise<AuthResult> {
  const { user, error } = await verifyAuthenticatedUser();

  if (error) {
    return { user: null, error };
  }

  if (user!.id !== requestedUserId) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Forbidden - You can only access your own data' },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}
