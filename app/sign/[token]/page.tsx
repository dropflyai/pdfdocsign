'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import SignaturePad from 'signature_pad';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface SigningData {
  request: {
    id: string;
    recipientEmail: string;
    recipientName: string | null;
    message: string | null;
    status: string;
    expiresAt: string;
  };
  document: {
    id: string;
    name: string;
    downloadUrl: string;
  };
  sender: {
    name: string;
  };
}

export default function SigningPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingData, setSigningData] = useState<SigningData | null>(null);
  const [pdfFile, setPdfFile] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    loadSigningRequest();
  }, [token]);

  useEffect(() => {
    if (showSignatureModal && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
      });
    }
  }, [showSignatureModal]);

  const loadSigningRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sign/${token}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to load document');
        return;
      }

      const data = await response.json();
      setSigningData(data);
      setSignerName(data.request.recipientName || '');

      // Load the PDF
      const pdfResponse = await fetch(data.document.downloadUrl);
      const pdfBlob = await pdfResponse.blob();
      setPdfFile(pdfBlob);
    } catch (err) {
      setError('Failed to load signing request');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert('Please draw your signature');
      return;
    }

    if (!signerName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      setSubmitting(true);

      // Get signature as PNG with transparent background
      const canvas = signatureCanvasRef.current!;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(canvas, 0, 0);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
          data[i + 3] = 0;
        }
      }
      tempCtx.putImageData(imageData, 0, 0);
      const signatureData = tempCanvas.toDataURL('image/png');

      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureData,
          signerName: signerName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit signature');
      }

      const result = await response.json();
      setSigned(true);
      setSignedAt(result.signedAt);
      setShowSignatureModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit signature');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#0f0f0f] rounded-2xl border border-red-800/50 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Unable to Load Document</h1>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  // Signed success state
  if (signed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#0f0f0f] rounded-2xl border border-green-800/50 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Document Signed</h1>
          <p className="text-zinc-400 mb-4">
            Thank you, {signerName}. Your signature has been recorded.
          </p>
          <div className="bg-zinc-800/50 rounded-lg p-4 text-left">
            <p className="text-sm text-zinc-500 mb-1">Signed at</p>
            <p className="text-white font-medium">{signedAt && formatDate(signedAt)}</p>
          </div>
          <p className="text-xs text-zinc-500 mt-6">
            A confirmation has been sent to {signingData?.sender.name}. You can close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xl font-bold text-white">PDF Doc Sign</span>
            </div>
            <button
              onClick={() => setShowSignatureModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/20"
            >
              Sign Document
            </button>
          </div>
        </div>
      </header>

      {/* Document info banner */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-purple-800/30">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-purple-400 mb-1">
                {signingData?.sender.name} has requested your signature
              </p>
              <h1 className="text-lg font-semibold text-white">{signingData?.document.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Expires</p>
              <p className="text-sm text-zinc-300">
                {signingData && formatDate(signingData.request.expiresAt)}
              </p>
            </div>
          </div>
          {signingData?.request.message && (
            <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-300 italic">&ldquo;{signingData.request.message}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-zinc-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {pdfFile && (
            <div className="bg-white shadow-2xl mx-auto w-fit rounded-lg overflow-hidden">
              <Document
                file={pdfFile}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="p-20 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  width={Math.min(window.innerWidth - 64, 800)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}

          {/* Page navigation */}
          {numPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-zinc-400">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                disabled={currentPage === numPages}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] rounded-2xl border border-zinc-800 p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Sign Document</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Draw Your Signature
              </label>
              <div className="border-2 border-zinc-700 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={signatureCanvasRef}
                  width={450}
                  height={150}
                  className="w-full touch-none"
                />
              </div>
              <button
                onClick={() => signaturePadRef.current?.clear()}
                className="mt-2 text-sm text-purple-400 hover:text-purple-300"
              >
                Clear signature
              </button>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-zinc-400">
                By signing, you agree that your electronic signature is legally binding and has the same effect as a handwritten signature. Your signature will be timestamped and verified.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Signing...' : 'Sign Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
