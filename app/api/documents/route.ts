import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';
import { logRateLimited, logDocumentEvent } from '@/lib/security/audit-log';
import { uploadDocument, listDocuments } from '@/lib/storage/documents';
import { checkDocumentLimit } from '@/lib/subscription/check';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/documents - List user's documents
export async function GET(request: NextRequest) {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') as 'draft' | 'signed' | 'sent' | 'completed' | null;

    // Get documents
    const { documents, total } = await listDocuments(supabaseAdmin, user!.id, {
      limit: Math.min(limit, 100), // Cap at 100
      offset,
      status: status || undefined,
    });

    return NextResponse.json({ documents, total });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload a new document
export async function POST(request: NextRequest) {
  try {
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

    // Check free tier document limit (3 docs/month)
    const limitCheck = await checkDocumentLimit(supabaseAdmin, user!.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Free plan limit reached',
          code: 'DOCUMENT_LIMIT_REACHED',
          documentsUsed: limitCheck.documentsUsed,
          documentsLimit: limitCheck.documentsLimit,
          resetDate: limitCheck.resetDate,
          message: `You've reached your free plan limit of ${limitCheck.documentsLimit} documents this month. Upgrade to Pro for unlimited documents.`,
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const pageCount = parseInt(formData.get('pageCount') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Upload document
    const document = await uploadDocument(supabaseAdmin, user!.id, {
      name: name || file.name,
      file,
      pageCount,
    });

    // Audit log
    await logDocumentEvent('document.created', request, user!.id, document.id, {
      name: document.name,
      size: document.file_size,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload document';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
