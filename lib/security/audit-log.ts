// Audit log event types
export type AuditEventType =
  // Authentication events
  | 'auth.login'
  | 'auth.logout'
  | 'auth.signup'
  | 'auth.password_reset'
  | 'auth.failed_login'
  // Authorization events
  | 'authz.access_denied'
  | 'authz.rate_limited'
  // Document events
  | 'document.created'
  | 'document.viewed'
  | 'document.downloaded'
  | 'document.deleted'
  | 'document.signed'
  // Subscription events
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.trial_started'
  // Admin events
  | 'admin.settings_changed'
  | 'admin.user_modified';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  event_type: AuditEventType;
  severity: AuditSeverity;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  success: boolean;
}

/**
 * Log an audit event using Supabase REST API directly
 * Non-blocking - failures are logged but don't affect request flow
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const logEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(logEntry, null, 2));
  }

  // Log to database via REST API
  if (url && key) {
    try {
      const response = await fetch(`${url}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          event_type: entry.event_type,
          severity: entry.severity,
          user_id: entry.user_id || null,
          ip_address: entry.ip_address || null,
          user_agent: entry.user_agent || null,
          resource_type: entry.resource_type || null,
          resource_id: entry.resource_id || null,
          details: entry.details || {},
          success: entry.success,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        // Don't throw - audit logging should never break main flow
        console.error('[AUDIT] Failed to write to database:', response.status);
      }
    } catch (err) {
      console.error('[AUDIT] Database error:', err);
    }
  }

  // For critical events, could add additional alerting here
  if (entry.severity === 'critical') {
    console.error('[AUDIT CRITICAL]', logEntry);
    // In production: send to monitoring service, Slack, etc.
  }
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMetadata(request: Request): {
  ip_address: string;
  user_agent: string;
} {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip_address = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';

  const user_agent = request.headers.get('user-agent') || 'unknown';

  return { ip_address, user_agent };
}

// Convenience functions for common audit events

export async function logAuthEvent(
  type: 'auth.login' | 'auth.logout' | 'auth.signup' | 'auth.password_reset' | 'auth.failed_login',
  request: Request,
  userId?: string,
  success = true,
  details?: Record<string, unknown>
): Promise<void> {
  const metadata = getRequestMetadata(request);
  await logAuditEvent({
    event_type: type,
    severity: success ? 'info' : 'warning',
    user_id: userId,
    ...metadata,
    success,
    details,
  });
}

export async function logAccessDenied(
  request: Request,
  userId: string | undefined,
  resourceType: string,
  resourceId?: string,
  reason?: string
): Promise<void> {
  const metadata = getRequestMetadata(request);
  await logAuditEvent({
    event_type: 'authz.access_denied',
    severity: 'warning',
    user_id: userId,
    resource_type: resourceType,
    resource_id: resourceId,
    ...metadata,
    success: false,
    details: { reason },
  });
}

export async function logRateLimited(
  request: Request,
  endpoint: string,
  userId?: string
): Promise<void> {
  const metadata = getRequestMetadata(request);
  await logAuditEvent({
    event_type: 'authz.rate_limited',
    severity: 'warning',
    user_id: userId,
    resource_type: 'endpoint',
    resource_id: endpoint,
    ...metadata,
    success: false,
  });
}

export async function logDocumentEvent(
  type: 'document.created' | 'document.viewed' | 'document.downloaded' | 'document.deleted' | 'document.signed',
  request: Request,
  userId: string,
  documentId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const metadata = getRequestMetadata(request);
  await logAuditEvent({
    event_type: type,
    severity: 'info',
    user_id: userId,
    resource_type: 'document',
    resource_id: documentId,
    ...metadata,
    success: true,
    details,
  });
}

export async function logSubscriptionEvent(
  type: 'subscription.created' | 'subscription.updated' | 'subscription.canceled' | 'subscription.trial_started',
  userId: string,
  subscriptionId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    event_type: type,
    severity: 'info',
    user_id: userId,
    resource_type: 'subscription',
    resource_id: subscriptionId,
    success: true,
    details,
  });
}
