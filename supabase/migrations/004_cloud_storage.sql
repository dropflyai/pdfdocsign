-- 004_cloud_storage.sql
-- Add annotations column to documents and set up storage bucket

-- Add annotations column for saving PDF edits (text, signatures, forms)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS annotations JSONB DEFAULT '[]';

-- Add thumbnail_path for document previews
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Create storage bucket for documents (run via Supabase Dashboard or API)
-- Bucket name: documents
-- Public: false (require auth)
-- File size limit: 10MB
-- Allowed MIME types: application/pdf

-- Note: Storage bucket must be created via Dashboard or supabase-js client
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('documents', 'documents', false, 10485760, ARRAY['application/pdf']);

-- RLS policies for documents bucket (storage.objects)
-- These allow users to only access their own files

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create index on documents for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
