'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SendForSignatureModalProps {
  documentId: string;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendForSignatureModal({
  documentId,
  documentName,
  isOpen,
  onClose,
  onSuccess,
}: SendForSignatureModalProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);

  // Escape key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  }, [onClose, loading]);

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);

    // Focus first input on open
    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 50);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/signature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          recipientEmail,
          recipientName: recipientName || undefined,
          message: message || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send signature request');
      }

      setSuccess(true);
      onSuccess?.();

      // Reset and close after 2 seconds
      setTimeout(() => {
        setRecipientEmail('');
        setRecipientName('');
        setMessage('');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-[#0f0f0f] rounded-2xl border border-zinc-800 p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Request Sent!</h2>
            <p className="text-zinc-400">
              An email has been sent to {recipientEmail}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 id="modal-title" className="text-xl font-bold text-white">Send for Signature</h2>
              <button
                onClick={onClose}
                disabled={loading}
                aria-label="Close modal"
                className="text-zinc-400 hover:text-white disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-500 mb-1">Document</p>
              <p className="text-white font-medium truncate">{documentName}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="recipient-email" className="block text-sm font-medium text-zinc-400 mb-2">
                    Recipient Email <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={firstFocusableRef}
                    id="recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                    autoComplete="email"
                    aria-required="true"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="recipient-name" className="block text-sm font-medium text-zinc-400 mb-2">
                    Recipient Name (optional)
                  </label>
                  <input
                    id="recipient-name"
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please review and sign this document..."
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !recipientEmail}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-4 text-xs text-zinc-500 text-center">
              The recipient will receive an email with a secure link to sign the document.
              The link expires in 7 days.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
