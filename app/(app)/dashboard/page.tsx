'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDocuments } from '@/contexts/DocumentContext';
import { usePremium } from '@/contexts/PremiumContext';
import SignatureRequestList from '@/components/app/SignatureRequestList';
import type { DocumentRecord } from '@/lib/storage/documents';

const PDFEditor = dynamic(() => import('@/components/PDFEditorSimple'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading PDF Editor...</div>
});

export default function DashboardPage() {
  const { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument, getDocumentWithUrl } = useDocuments();
  const { isPremium } = usePremium();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentDocument, setCurrentDocument] = useState<DocumentRecord | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await processAndUploadFile(file);
    }
  };

  const processAndUploadFile = async (file: File) => {
    try {
      setUploading(true);
      // Upload to cloud storage
      const doc = await uploadDocument(file, file.name);

      // Create a File object for the editor
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const processedFile = new File([blob], file.name, { type: 'application/pdf' });

      setPdfFile(processedFile);
      setCurrentDocument(doc);
    } catch (err) {
      console.error('Error uploading PDF:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDocument = async (doc: DocumentRecord) => {
    try {
      setUploading(true);
      const { downloadUrl } = await getDocumentWithUrl(doc.id);

      // Fetch the PDF file
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const file = new File([blob], doc.name, { type: 'application/pdf' });

      setPdfFile(file);
      setCurrentDocument(doc);
    } catch (err) {
      console.error('Error opening document:', err);
      alert(err instanceof Error ? err.message : 'Failed to open document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(docId);
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setCurrentDocument(null);
    fetchDocuments(); // Refresh list
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      await processAndUploadFile(file);
    } else if (file) {
      alert('Please upload a PDF file');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // If a PDF is loaded, show the editor
  if (pdfFile) {
    return (
      <div className="h-[calc(100vh-64px)]">
        <PDFEditor
          file={pdfFile}
          onReset={handleReset}
          documentId={currentDocument?.id}
          initialAnnotations={currentDocument?.annotations}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Upload a PDF to start editing</p>
      </div>

      {/* Upload area */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-zinc-800 p-8">
        <label
          htmlFor="pdf-upload"
          className={`block relative cursor-pointer ${isDragging ? 'scale-[1.01]' : ''} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800/50'
          }`}>
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {uploading ? 'Uploading...' : 'Drop your PDF here'}
            </h3>
            <p className="text-zinc-400 mb-6">
              or click to browse files
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload PDF
            </div>
          </div>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Recent documents */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Documents</h2>

        {loading && (
          <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading documents...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 rounded-xl border border-red-800 p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 text-sm text-purple-400 hover:text-purple-300"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-zinc-400">No documents yet</p>
            <p className="text-sm text-zinc-500 mt-1">
              Upload your first PDF to get started
            </p>
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleOpenDocument(doc)}
                className="bg-[#0f0f0f] rounded-xl border border-zinc-800 p-4 text-left hover:border-purple-500/50 hover:bg-zinc-800/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => handleDeleteDocument(doc.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-all"
                    title="Delete document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <h3 className="font-medium text-white mt-3 truncate">{doc.name}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500">
                  <span>{formatDate(doc.updated_at || doc.created_at)}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                    doc.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                    doc.status === 'signed' ? 'bg-blue-900/30 text-blue-400' :
                    doc.status === 'sent' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Signature Requests (Pro feature) */}
      {isPremium && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Signature Requests</h2>
          <SignatureRequestList onRefresh={fetchDocuments} />
        </div>
      )}
    </div>
  );
}
