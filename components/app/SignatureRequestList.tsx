'use client';

import { useState, useEffect, useCallback } from 'react';

interface SignatureRequest {
  id: string;
  document_id: string;
  recipient_email: string;
  recipient_name: string | null;
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired';
  message: string | null;
  access_token: string;
  signed_at: string | null;
  expires_at: string;
  created_at: string;
  documents?: {
    name: string;
  };
}

interface SignatureRequestListProps {
  onRefresh?: () => void;
}

export default function SignatureRequestList({ onRefresh }: SignatureRequestListProps) {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/signature-requests?limit=10');

      if (!response.ok) {
        throw new Error('Failed to load signature requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const copySigningLink = async (accessToken: string, requestId: string) => {
    const url = `${window.location.origin}/sign/${accessToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(requestId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(requestId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!confirm('Cancel this signature request? The recipient will no longer be able to sign.')) {
      return;
    }

    try {
      const response = await fetch(`/api/signature-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      setRequests(prev => prev.filter(r => r.id !== requestId));
      onRefresh?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'signed':
        return {
          label: 'Signed',
          className: 'bg-green-900/30 text-green-400',
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'viewed':
        return {
          label: 'Viewed',
          className: 'bg-blue-900/30 text-blue-400',
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-900/30 text-yellow-400',
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'expired':
        return {
          label: 'Expired',
          className: 'bg-zinc-800 text-zinc-400',
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'declined':
        return {
          label: 'Declined',
          className: 'bg-red-900/30 text-red-400',
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      default:
        return {
          label: status,
          className: 'bg-zinc-800 text-zinc-400',
          icon: null,
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-zinc-800 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-900/20 rounded-xl border border-red-800 p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchRequests}
          className="mt-2 text-sm text-purple-400 hover:text-purple-300"
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty state (following EmptyStates.md pattern)
  if (requests.length === 0) {
    return (
      <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-white font-medium">No signature requests yet</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
          Send documents for signature to track their status here.
        </p>
      </div>
    );
  }

  // Default state with data (following Lists.md pattern)
  return (
    <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 overflow-hidden">
      <ul role="list" className="divide-y divide-zinc-800">
        {requests.map((request) => {
          const statusConfig = getStatusConfig(request.status);
          const isActionable = request.status === 'pending' || request.status === 'viewed';

          return (
            <li
              key={request.id}
              className="p-4 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Lead: Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Primary: Recipient */}
                  <p className="text-white font-medium truncate">
                    {request.recipient_name || request.recipient_email}
                  </p>
                  {/* Secondary: Document name + date */}
                  <p className="text-sm text-zinc-400 truncate">
                    {request.documents?.name || 'Document'} · Sent {formatDate(request.created_at)}
                  </p>
                </div>

                {/* Trail: Status badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Actions row (visible on hover for non-signed) */}
              {isActionable && (
                <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copySigningLink(request.access_token, request.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-900/20 rounded-lg hover:bg-purple-900/40 transition-colors"
                  >
                    {copiedId === request.id ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy link
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => cancelRequest(request.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}

              {/* Signed timestamp */}
              {request.status === 'signed' && request.signed_at && (
                <p className="mt-2 text-xs text-green-400/70">
                  Signed on {formatDate(request.signed_at)}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
