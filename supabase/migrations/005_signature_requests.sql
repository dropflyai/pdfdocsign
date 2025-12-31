-- 005_signature_requests.sql
-- Tables for Send for Signature feature

-- Signature requests table
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'signed', 'declined', 'expired')),
  message TEXT,
  access_token TEXT UNIQUE NOT NULL,
  signed_document_path TEXT, -- Path to signed version in storage
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signature events audit trail
CREATE TABLE IF NOT EXISTS signature_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'viewed', 'signed', 'declined', 'expired', 'reminder_sent')),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for signature_requests

-- Enable RLS
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_events ENABLE ROW LEVEL SECURITY;

-- Senders can view their own requests
CREATE POLICY "Users can view own signature requests"
ON signature_requests FOR SELECT
TO authenticated
USING (sender_id = auth.uid());

-- Senders can create signature requests
CREATE POLICY "Users can create signature requests"
ON signature_requests FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Senders can update their own requests (e.g., cancel)
CREATE POLICY "Users can update own signature requests"
ON signature_requests FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

-- Senders can delete their own requests
CREATE POLICY "Users can delete own signature requests"
ON signature_requests FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Service role can access all (for public signing endpoint)
CREATE POLICY "Service role full access to signature_requests"
ON signature_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Events policies
CREATE POLICY "Users can view events for own requests"
ON signature_events FOR SELECT
TO authenticated
USING (
  request_id IN (
    SELECT id FROM signature_requests WHERE sender_id = auth.uid()
  )
);

CREATE POLICY "Service role full access to signature_events"
ON signature_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signature_requests_sender_id ON signature_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id ON signature_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_access_token ON signature_requests(access_token);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON signature_requests(status);
CREATE INDEX IF NOT EXISTS idx_signature_requests_expires_at ON signature_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_signature_events_request_id ON signature_events(request_id);
CREATE INDEX IF NOT EXISTS idx_signature_events_created_at ON signature_events(created_at DESC);
