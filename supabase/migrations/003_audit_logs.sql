-- Audit logs table for security compliance
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Index for querying by event type
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

-- Index for querying by timestamp (for log rotation/cleanup)
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Index for querying by severity (for alerting)
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity) WHERE severity IN ('warning', 'error', 'critical');

-- Composite index for common queries
CREATE INDEX idx_audit_logs_user_event ON audit_logs(user_id, event_type, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (API routes use service role key)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read all logs
CREATE POLICY "Service role can read audit logs"
  ON audit_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Users can read their own audit logs (optional - for account activity page)
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Comment for documentation
COMMENT ON TABLE audit_logs IS 'Security audit trail for compliance (SOC 2, HIPAA)';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event: auth.*, authz.*, document.*, subscription.*';
COMMENT ON COLUMN audit_logs.severity IS 'Log level: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.details IS 'Additional context as JSON';
