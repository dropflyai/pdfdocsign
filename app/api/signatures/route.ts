import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthenticatedUser } from '@/lib/auth/verify-user';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/security/rate-limit';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/signatures - List saved signatures for the current user
export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`signatures:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
    }

    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const { data: signatures, error } = await getSupabaseAdmin()
      .from('signatures')
      .select('id, name, signature_data, is_default, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to load signatures' }, { status: 500 });
    }

    return NextResponse.json({ signatures: signatures || [] });
  } catch (error) {
    console.error('Error listing signatures:', error);
    return NextResponse.json({ error: 'Failed to list signatures' }, { status: 500 });
  }
}

// POST /api/signatures - Save a new signature
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`signatures:${clientIP}`, RATE_LIMITS.api);
    if (!rateLimitResult.success) {
      return rateLimitResult.error!;
    }

    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const body = await request.json();
    const { name, signatureData } = body;

    if (!signatureData) {
      return NextResponse.json({ error: 'Signature data is required' }, { status: 400 });
    }

    // Limit saved signatures to 10 per user
    const { count } = await getSupabaseAdmin()
      .from('signatures')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id);

    if (count && count >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 saved signatures allowed. Please delete an existing one first.' },
        { status: 400 }
      );
    }

    const { data: signature, error } = await getSupabaseAdmin()
      .from('signatures')
      .insert({
        user_id: user!.id,
        name: name || 'My Signature',
        signature_data: signatureData,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
    }

    return NextResponse.json({ signature }, { status: 201 });
  } catch (error) {
    console.error('Error saving signature:', error);
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
  }
}

// DELETE /api/signatures - Delete a signature (by id in query params)
export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuthenticatedUser();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const signatureId = searchParams.get('id');

    if (!signatureId) {
      return NextResponse.json({ error: 'Signature ID is required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('signatures')
      .delete()
      .eq('id', signatureId)
      .eq('user_id', user!.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting signature:', error);
    return NextResponse.json({ error: 'Failed to delete signature' }, { status: 500 });
  }
}
