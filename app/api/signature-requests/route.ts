import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logRateLimited } from '@/lib/security/audit-log';
import { createSignatureRequest, listSignatureRequests, logSignatureEvent } from '@/lib/signature/requests';
import { sendSignatureRequestEmail } from '@/lib/signature/email';
import { getDocument } from '@/lib/storage/documents';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/signature-requests - List user's signature requests
export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`signature-requests:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'signature-requests');
      return rateLimitResult.error!;
    }

    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId') || undefined;
    const status = searchParams.get('status') as 'pending' | 'viewed' | 'signed' | 'declined' | 'expired' | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { requests, total } = await listSignatureRequests(getSupabaseAdmin(), user!.id, {
      documentId,
      status: status || undefined,
      limit: Math.min(limit, 100),
      offset,
    });

    return NextResponse.json({ requests, total });
  } catch (error) {
    console.error('Error listing signature requests:', error);
    return NextResponse.json(
      { error: 'Failed to list signature requests' },
      { status: 500 }
    );
  }
}

// POST /api/signature-requests - Create a new signature request
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`signature-requests:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'signature-requests');
      return rateLimitResult.error!;
    }

    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const body = await request.json();
    const { documentId, recipientEmail, recipientName, message, expiresInDays } = body;

    if (!documentId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Document ID and recipient email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Verify user owns the document
    const document = await getDocument(getSupabaseAdmin(), documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.user_id !== user!.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create signature request
    const signatureRequest = await createSignatureRequest(getSupabaseAdmin(), user!.id, {
      documentId,
      recipientEmail,
      recipientName,
      message,
      expiresInDays: expiresInDays || 7,
    });

    // Log the sent event
    await logSignatureEvent(getSupabaseAdmin(), signatureRequest.id, 'sent', {
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Send email notification
    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signatureRequest.access_token}`;

    // Get sender info
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('full_name')
      .eq('id', user!.id)
      .single();

    const senderName = profile?.full_name || user!.email.split('@')[0];

    const emailResult = await sendSignatureRequestEmail({
      to: recipientEmail,
      recipientName,
      senderName,
      senderEmail: user!.email,
      documentName: document.name,
      message,
      signingUrl,
      expiresAt: new Date(signatureRequest.expires_at),
    });

    if (!emailResult.success) {
      console.error('Failed to send signature request email:', emailResult.error);
      // Don't fail the request, email can be resent
    }

    return NextResponse.json({
      request: signatureRequest,
      emailSent: emailResult.success,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating signature request:', error);
    const message = error instanceof Error ? error.message : 'Failed to create signature request';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
