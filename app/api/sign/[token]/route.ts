import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { getSignatureRequestByToken, updateSignatureRequestStatus, logSignatureEvent, isExpired } from '@/lib/signature/requests';
import { getDocumentDownloadUrl } from '@/lib/storage/documents';
import { sendSignatureCompletedEmail } from '@/lib/signature/email';
import { createHash } from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ token: string }>;
}

// Generate a verification hash for the signed document
function generateDocumentHash(pdfBytes: ArrayBuffer, timestamp: string, signerInfo: string): string {
  const hash = createHash('sha256');
  hash.update(Buffer.from(pdfBytes));
  hash.update(timestamp);
  hash.update(signerInfo);
  return hash.digest('hex');
}

// GET /api/sign/[token] - Get document for signing (public endpoint)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`sign:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
    }

    // Get signature request by token
    const signatureRequest = await getSignatureRequestByToken(supabaseAdmin, token);

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired signing link' },
        { status: 404 }
      );
    }

    // Check if expired
    if (isExpired(signatureRequest)) {
      await updateSignatureRequestStatus(supabaseAdmin, signatureRequest.id, 'expired');
      await logSignatureEvent(supabaseAdmin, signatureRequest.id, 'expired', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json(
        { error: 'This signing link has expired' },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'This document has already been signed' },
        { status: 400 }
      );
    }

    // Get document info
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('id, name, storage_path, annotations')
      .eq('id', signatureRequest.document_id)
      .single();

    if (!document || !document.storage_path) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get sender info
    const { data: sender } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', signatureRequest.sender_id)
      .single();

    // Get download URL for the PDF
    const downloadUrl = await getDocumentDownloadUrl(supabaseAdmin, document.storage_path);

    // Log view event if first time viewing
    if (signatureRequest.status === 'pending') {
      await updateSignatureRequestStatus(supabaseAdmin, signatureRequest.id, 'viewed');
      await logSignatureEvent(supabaseAdmin, signatureRequest.id, 'viewed', {
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({
      request: {
        id: signatureRequest.id,
        recipientEmail: signatureRequest.recipient_email,
        recipientName: signatureRequest.recipient_name,
        message: signatureRequest.message,
        status: signatureRequest.status,
        expiresAt: signatureRequest.expires_at,
      },
      document: {
        id: document.id,
        name: document.name,
        downloadUrl,
        annotations: document.annotations || [],
      },
      sender: {
        name: sender?.full_name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Error getting signing request:', error);
    return NextResponse.json(
      { error: 'Failed to load document' },
      { status: 500 }
    );
  }
}

// POST /api/sign/[token] - Submit signature (public endpoint)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`sign:${clientIP}`, { limit: 10, windowSeconds: 60 });
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
    }

    // Get signature request by token
    const signatureRequest = await getSignatureRequestByToken(supabaseAdmin, token);

    if (!signatureRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired signing link' },
        { status: 404 }
      );
    }

    // Check if expired
    if (isExpired(signatureRequest)) {
      return NextResponse.json(
        { error: 'This signing link has expired' },
        { status: 410 }
      );
    }

    // Check if already signed
    if (signatureRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'This document has already been signed' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { signatureData, signerName } = body;

    if (!signatureData) {
      return NextResponse.json(
        { error: 'Signature is required' },
        { status: 400 }
      );
    }

    // Get document
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('id, name, storage_path, annotations')
      .eq('id', signatureRequest.document_id)
      .single();

    if (!document || !document.storage_path) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const signedAt = new Date();
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Create verification metadata
    const verificationData = {
      signedAt: signedAt.toISOString(),
      signerEmail: signatureRequest.recipient_email,
      signerName: signerName || signatureRequest.recipient_name || signatureRequest.recipient_email,
      signerIP: clientIP,
      userAgent,
      documentId: document.id,
      documentName: document.name,
      requestId: signatureRequest.id,
    };

    // Update document with signature annotation
    const existingAnnotations = document.annotations || [];
    const signatureAnnotation = {
      id: `signature-${Date.now()}`,
      type: 'signature',
      pageNumber: 1, // Default to first page - in a real implementation, user would place it
      x: 100,
      y: 600,
      width: 200,
      height: 100,
      imageData: signatureData,
      isFormField: false,
      verification: verificationData,
    };

    await supabaseAdmin
      .from('documents')
      .update({
        annotations: [...existingAnnotations, signatureAnnotation],
        status: 'signed',
        updated_at: signedAt.toISOString(),
      })
      .eq('id', document.id);

    // Update signature request status
    await updateSignatureRequestStatus(supabaseAdmin, signatureRequest.id, 'signed', {
      signedAt: signedAt.toISOString(),
    });

    // Log signed event with full audit trail
    await logSignatureEvent(supabaseAdmin, signatureRequest.id, 'signed', {
      ipAddress: clientIP,
      userAgent,
      extra: verificationData,
    });

    // Send notification to sender
    const { data: sender } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', signatureRequest.sender_id)
      .single();

    const { data: senderAuth } = await supabaseAdmin.auth.admin.getUserById(signatureRequest.sender_id);

    if (senderAuth?.user?.email) {
      await sendSignatureCompletedEmail({
        to: senderAuth.user.email,
        senderName: sender?.full_name || 'User',
        documentName: document.name,
        signerName: signerName || signatureRequest.recipient_name || signatureRequest.recipient_email,
        signerEmail: signatureRequest.recipient_email,
        signedAt,
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });
    }

    return NextResponse.json({
      success: true,
      signedAt: signedAt.toISOString(),
      verification: {
        timestamp: signedAt.toISOString(),
        signerEmail: signatureRequest.recipient_email,
        documentId: document.id,
      },
    });
  } catch (error) {
    console.error('Error submitting signature:', error);
    return NextResponse.json(
      { error: 'Failed to submit signature' },
      { status: 500 }
    );
  }
}
