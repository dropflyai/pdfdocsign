import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export interface SignatureRequest {
  id: string;
  document_id: string;
  sender_id: string;
  recipient_email: string;
  recipient_name: string | null;
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired';
  message: string | null;
  access_token: string;
  signed_document_path: string | null;
  signed_at: string | null;
  expires_at: string;
  created_at: string;
  document_hash?: string | null;
}

export interface SignatureEvent {
  id: string;
  request_id: string;
  event_type: 'sent' | 'viewed' | 'signed' | 'declined' | 'expired' | 'reminder_sent';
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateSignatureRequestInput {
  documentId: string;
  recipientEmail: string;
  recipientName?: string;
  message?: string;
  expiresInDays?: number;
}

// Generate a secure access token
function generateAccessToken(): string {
  return randomUUID() + '-' + randomUUID();
}

// Create a new signature request
export async function createSignatureRequest(
  supabase: SupabaseClient,
  senderId: string,
  input: CreateSignatureRequestInput
): Promise<SignatureRequest> {
  const { documentId, recipientEmail, recipientName, message, expiresInDays = 7 } = input;

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Generate unique access token
  const accessToken = generateAccessToken();

  const { data, error } = await supabase
    .from('signature_requests')
    .insert({
      document_id: documentId,
      sender_id: senderId,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      message: message || null,
      access_token: accessToken,
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create signature request: ${error.message}`);
  }

  return data;
}

// Get a signature request by ID
export async function getSignatureRequest(
  supabase: SupabaseClient,
  requestId: string
): Promise<SignatureRequest | null> {
  const { data, error } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get signature request: ${error.message}`);
  }

  return data;
}

// Get a signature request by access token (for public signing page)
export async function getSignatureRequestByToken(
  supabase: SupabaseClient,
  token: string
): Promise<SignatureRequest | null> {
  const { data, error } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('access_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get signature request: ${error.message}`);
  }

  return data;
}

// List signature requests for a user (as sender)
export async function listSignatureRequests(
  supabase: SupabaseClient,
  senderId: string,
  options?: {
    documentId?: string;
    status?: SignatureRequest['status'];
    limit?: number;
    offset?: number;
  }
): Promise<{ requests: SignatureRequest[]; total: number }> {
  let query = supabase
    .from('signature_requests')
    .select('*', { count: 'exact' })
    .eq('sender_id', senderId)
    .order('created_at', { ascending: false });

  if (options?.documentId) {
    query = query.eq('document_id', options.documentId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list signature requests: ${error.message}`);
  }

  return { requests: data || [], total: count || 0 };
}

// Update signature request status
export async function updateSignatureRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  status: SignatureRequest['status'],
  updates?: {
    signedDocumentPath?: string;
    signedAt?: string;
  }
): Promise<SignatureRequest> {
  const updateData: Record<string, unknown> = { status };

  if (updates?.signedDocumentPath) {
    updateData.signed_document_path = updates.signedDocumentPath;
  }

  if (updates?.signedAt) {
    updateData.signed_at = updates.signedAt;
  }

  const { data, error } = await supabase
    .from('signature_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update signature request: ${error.message}`);
  }

  return data;
}

// Delete/cancel a signature request
export async function deleteSignatureRequest(
  supabase: SupabaseClient,
  requestId: string
): Promise<void> {
  const { error } = await supabase
    .from('signature_requests')
    .delete()
    .eq('id', requestId);

  if (error) {
    throw new Error(`Failed to delete signature request: ${error.message}`);
  }
}

// Log a signature event
export async function logSignatureEvent(
  supabase: SupabaseClient,
  requestId: string,
  eventType: SignatureEvent['event_type'],
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    extra?: Record<string, unknown>;
  }
): Promise<SignatureEvent> {
  const { data, error } = await supabase
    .from('signature_events')
    .insert({
      request_id: requestId,
      event_type: eventType,
      ip_address: metadata?.ipAddress || null,
      user_agent: metadata?.userAgent || null,
      metadata: metadata?.extra || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log signature event: ${error.message}`);
  }

  return data;
}

// Get signature events for a request
export async function getSignatureEvents(
  supabase: SupabaseClient,
  requestId: string
): Promise<SignatureEvent[]> {
  const { data, error } = await supabase
    .from('signature_events')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get signature events: ${error.message}`);
  }

  return data || [];
}

// Check if a signature request has expired
export function isExpired(request: SignatureRequest): boolean {
  return new Date(request.expires_at) < new Date();
}

// Get request with document info (for displaying)
export async function getSignatureRequestWithDocument(
  supabase: SupabaseClient,
  requestId: string
): Promise<(SignatureRequest & { document: { id: string; name: string; storage_path: string } }) | null> {
  const { data, error } = await supabase
    .from('signature_requests')
    .select(`
      *,
      document:documents(id, name, storage_path)
    `)
    .eq('id', requestId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get signature request: ${error.message}`);
  }

  return data;
}
