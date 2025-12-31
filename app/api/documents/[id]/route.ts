import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logRateLimited, logDocumentEvent, logAccessDenied } from '@/lib/security/audit-log';
import { getDocument, updateDocument, deleteDocument, getDocumentDownloadUrl } from '@/lib/storage/documents';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Get a document's details and download URL
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: documentId } = await params;

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`documents:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'documents');
      return rateLimitResult.error!;
    }

    // Verify authentication
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    // Get document
    const document = await getDocument(supabaseAdmin, documentId);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (document.user_id !== user!.id) {
      await logAccessDenied(request, user!.id, 'document', documentId, 'Not owner');
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get signed download URL
    let downloadUrl = null;
    if (document.storage_path) {
      downloadUrl = await getDocumentDownloadUrl(supabaseAdmin, document.storage_path);
    }

    // Audit log
    await logDocumentEvent('document.viewed', request, user!.id, documentId);

    return NextResponse.json({ document, downloadUrl });
  } catch (error) {
    console.error('Error getting document:', error);
    return NextResponse.json(
      { error: 'Failed to get document' },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id] - Update a document
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: documentId } = await params;

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`documents:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'documents');
      return rateLimitResult.error!;
    }

    // Verify authentication
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    // Get existing document to verify ownership
    const existingDoc = await getDocument(supabaseAdmin, documentId);

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (existingDoc.user_id !== user!.id) {
      await logAccessDenied(request, user!.id, 'document', documentId, 'Not owner');
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse update data
    const body = await request.json();
    const { name, status, annotations, pageCount } = body;

    // Update document
    const document = await updateDocument(supabaseAdmin, documentId, {
      name,
      status,
      annotations,
      pageCount,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: documentId } = await params;

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`documents:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      await logRateLimited(request, 'documents');
      return rateLimitResult.error!;
    }

    // Verify authentication
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    // Get existing document to verify ownership
    const existingDoc = await getDocument(supabaseAdmin, documentId);

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (existingDoc.user_id !== user!.id) {
      await logAccessDenied(request, user!.id, 'document', documentId, 'Not owner');
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete document
    await deleteDocument(supabaseAdmin, documentId);

    // Audit log
    await logDocumentEvent('document.deleted', request, user!.id, documentId, {
      name: existingDoc.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
