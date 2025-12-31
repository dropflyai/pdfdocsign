import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface DocumentRecord {
  id: string;
  user_id: string;
  name: string;
  storage_path: string | null;
  file_size: number | null;
  page_count: number | null;
  status: 'draft' | 'signed' | 'sent' | 'completed';
  annotations: Annotation[];
  thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: string;
  type: 'text' | 'signature' | 'eraser' | 'formfield';
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  imageData?: string;
  fontSize?: number;
  textColor?: string;
  fieldName?: string;
  isFormField?: boolean;
  fieldType?: 'text' | 'checkbox' | 'radio' | 'dropdown';
  isChecked?: boolean;
  groupId?: string;
  groupIndex?: number;
}

export interface CreateDocumentInput {
  name: string;
  file: File | Blob;
  pageCount?: number;
}

export interface UpdateDocumentInput {
  name?: string;
  status?: DocumentRecord['status'];
  annotations?: Annotation[];
  pageCount?: number;
}

// Upload a PDF file to storage and create a document record
export async function uploadDocument(
  supabase: SupabaseClient,
  userId: string,
  input: CreateDocumentInput
): Promise<DocumentRecord> {
  const { name, file, pageCount } = input;

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Generate unique storage path: userId/timestamp-filename.pdf
  const timestamp = Date.now();
  const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${userId}/${timestamp}-${sanitizedName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create document record
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      name,
      storage_path: storagePath,
      file_size: file.size,
      page_count: pageCount || null,
      status: 'draft',
      annotations: [],
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup: delete uploaded file if DB insert fails
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error(`Failed to create document record: ${dbError.message}`);
  }

  return document;
}

// Get a document by ID
export async function getDocument(
  supabase: SupabaseClient,
  documentId: string
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to get document: ${error.message}`);
  }

  return data;
}

// List all documents for a user
export async function listDocuments(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: DocumentRecord['status'];
  }
): Promise<{ documents: DocumentRecord[]; total: number }> {
  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

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
    throw new Error(`Failed to list documents: ${error.message}`);
  }

  return { documents: data || [], total: count || 0 };
}

// Update a document
export async function updateDocument(
  supabase: SupabaseClient,
  documentId: string,
  input: UpdateDocumentInput
): Promise<DocumentRecord> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.annotations !== undefined) updateData.annotations = input.annotations;
  if (input.pageCount !== undefined) updateData.page_count = input.pageCount;

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }

  return data;
}

// Delete a document and its storage file
export async function deleteDocument(
  supabase: SupabaseClient,
  documentId: string
): Promise<void> {
  // First get the document to find storage path
  const doc = await getDocument(supabase, documentId);
  if (!doc) {
    throw new Error('Document not found');
  }

  // Delete from storage
  if (doc.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([doc.storage_path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
      // Continue with DB delete anyway
    }

    // Delete thumbnail if exists
    if (doc.thumbnail_path) {
      await supabase.storage.from(BUCKET_NAME).remove([doc.thumbnail_path]);
    }
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (dbError) {
    throw new Error(`Failed to delete document: ${dbError.message}`);
  }
}

// Get a signed URL for downloading the PDF
export async function getDocumentDownloadUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 3600 // 1 hour default
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to get download URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Download document as ArrayBuffer (for editing)
export async function downloadDocument(
  supabase: SupabaseClient,
  storagePath: string
): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error) {
    throw new Error(`Failed to download document: ${error.message}`);
  }

  return await data.arrayBuffer();
}

// Save updated PDF back to storage (after edits)
export async function saveDocumentFile(
  supabase: SupabaseClient,
  storagePath: string,
  file: Blob
): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .update(storagePath, file, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to save document: ${error.message}`);
  }
}
