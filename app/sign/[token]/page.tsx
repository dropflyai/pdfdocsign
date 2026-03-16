'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import SignaturePad from 'signature_pad';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

type SignatureMode = 'draw' | 'type' | 'upload';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface SigningData {
  request: {
    id: string;
    maskedEmail: string;
    recipientName: string | null;
    message: string | null;
    status: string;
    expiresAt: string;
  };
  document: {
    id: string;
    name: string;
    downloadUrl: string;
    annotations: Array<{ type: string; [key: string]: unknown }>;
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
  const [signerEmail, setSignerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSigningRequest();
  }, [token]);

  useEffect(() => {
    if (showSignatureModal && signatureMode === 'draw' && signatureCanvasRef.current) {
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
  }, [showSignatureModal, signatureMode]);

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

  const getDrawSignatureData = useCallback((): string | null => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return null;
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
    return tempCanvas.toDataURL('image/png');
  }, []);

  const getTypedSignatureData = useCallback((): string | null => {
    if (!typedSignature.trim()) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 150;
    const ctx = canvas.getContext('2d')!;
    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '48px "Dancing Script", cursive';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedSignature, 20, 75);
    return canvas.toDataURL('image/png');
  }, [typedSignature]);

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a PNG or JPG image');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Convert to transparent background
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setUploadedSignature(canvas.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSign = async () => {
    if (!signerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!signerEmail.trim()) {
      alert('Please enter your email for verification');
      return;
    }

    let signatureData: string | null = null;
    if (signatureMode === 'draw') {
      signatureData = getDrawSignatureData();
      if (!signatureData) {
        alert('Please draw your signature');
        return;
      }
    } else if (signatureMode === 'type') {
      signatureData = getTypedSignatureData();
      if (!signatureData) {
        alert('Please type your signature');
        return;
      }
    } else if (signatureMode === 'upload') {
      signatureData = uploadedSignature;
      if (!signatureData) {
        alert('Please upload a signature image');
        return;
      }
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureData,
          signerName: signerName.trim(),
          signerEmail: signerEmail.trim(),
        }),
      });

      if (!response.ok) {
        const respData = await response.json();
        throw new Error(respData.error || 'Failed to submit signature');
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
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&display=swap" rel="stylesheet" />
          <div className="bg-[#0f0f0f] rounded-2xl border border-zinc-800 p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Sign Document</h2>

            {/* Name field */}
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

            {/* Email field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Your Email {signingData?.request.maskedEmail && (
                  <span className="text-zinc-500 font-normal">(must match {signingData.request.maskedEmail})</span>
                )}
              </label>
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Signature mode tabs */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Your Signature
              </label>
              <div className="flex rounded-lg overflow-hidden border border-zinc-700 mb-3">
                {(['draw', 'type', 'upload'] as SignatureMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSignatureMode(mode)}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      signatureMode === mode
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {mode === 'draw' ? 'Draw' : mode === 'type' ? 'Type' : 'Upload'}
                  </button>
                ))}
              </div>

              {/* Draw mode */}
              {signatureMode === 'draw' && (
                <div>
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
              )}

              {/* Type mode */}
              {signatureMode === 'type' && (
                <div>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your name"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                  />
                  {typedSignature && (
                    <div className="border-2 border-zinc-700 rounded-lg bg-white p-6 flex items-center justify-center min-h-[100px]">
                      <span
                        style={{ fontFamily: "'Dancing Script', cursive", fontSize: '48px', color: '#000' }}
                      >
                        {typedSignature}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Upload mode */}
              {signatureMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleUploadSignature}
                    className="hidden"
                  />
                  {uploadedSignature ? (
                    <div className="border-2 border-zinc-700 rounded-lg bg-white p-4 flex flex-col items-center">
                      <img
                        src={uploadedSignature}
                        alt="Uploaded signature"
                        className="max-h-[120px] max-w-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setUploadedSignature(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                      >
                        Remove and re-upload
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors"
                    >
                      <svg className="w-8 h-8 text-zinc-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-zinc-400">Click to upload a PNG or JPG of your signature</p>
                    </button>
                  )}
                </div>
              )}
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
