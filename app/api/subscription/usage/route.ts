import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkDocumentLimit } from '@/lib/subscription/check';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/subscription/usage - Get the user's current usage and limits
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const limitCheck = await checkDocumentLimit(supabaseAdmin, user!.id);

    return NextResponse.json({
      documentsUsed: limitCheck.documentsUsed,
      documentsLimit: limitCheck.isPro ? null : limitCheck.documentsLimit, // null = unlimited
      isPro: limitCheck.isPro,
      canUpload: limitCheck.allowed,
      resetDate: limitCheck.resetDate || null,
    });
  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    );
  }
}
