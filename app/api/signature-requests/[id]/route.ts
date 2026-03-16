import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logRateLimited, logAccessDenied } from '@/lib/security/audit-log';
import { getSignatureRequest, getSignatureEvents, deleteSignatureRequest } from '@/lib/signature/requests';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/signature-requests/[id] - Get a signature request with events
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;

    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`signature-requests:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'signature-requests');
      return rateLimitResult.error!;
    }

    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const signatureRequest = await getSignatureRequest(getSupabaseAdmin(), requestId);

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Signature request not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (signatureRequest.sender_id !== user!.id) {
      await logAccessDenied(request, user!.id, 'signature_request', requestId, 'Not owner');
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get events for audit trail
    const events = await getSignatureEvents(getSupabaseAdmin(), requestId);

    return NextResponse.json({ request: signatureRequest, events });
  } catch (error) {
    console.error('Error getting signature request:', error);
    return NextResponse.json(
      { error: 'Failed to get signature request' },
      { status: 500 }
    );
  }
}

// DELETE /api/signature-requests/[id] - Cancel/delete a signature request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;

    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`signature-requests:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'signature-requests');
      return rateLimitResult.error!;
    }

    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const signatureRequest = await getSignatureRequest(getSupabaseAdmin(), requestId);

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Signature request not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (signatureRequest.sender_id !== user!.id) {
      await logAccessDenied(request, user!.id, 'signature_request', requestId, 'Not owner');
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Can't delete signed requests
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'Cannot delete a signed request' },
        { status: 400 }
      );
    }

    await deleteSignatureRequest(getSupabaseAdmin(), requestId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting signature request:', error);
    return NextResponse.json(
      { error: 'Failed to delete signature request' },
      { status: 500 }
    );
  }
}
