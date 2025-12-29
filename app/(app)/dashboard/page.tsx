'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(() => import('@/components/PDFEditorSimple'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading PDF Editor...</div>
});

export default function DashboardPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const processedFile = new File([blob], file.name, { type: 'application/pdf' });
        setPdfFile(processedFile);
      } catch (error) {
        console.error('Error processing PDF file:', error);
        alert('Failed to load PDF. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setPdfFile(null);
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
      try {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const processedFile = new File([blob], file.name, { type: 'application/pdf' });
        setPdfFile(processedFile);
      } catch (error) {
        console.error('Error processing PDF file:', error);
        alert('Failed to load PDF. Please try again.');
      }
    } else if (file) {
      alert('Please upload a PDF file');
    }
  };

  // If a PDF is loaded, show the editor
  if (pdfFile) {
    return (
      <div className="h-[calc(100vh-64px)]">
        <PDFEditor file={pdfFile} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Upload a PDF to start editing</p>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <label
          htmlFor="pdf-upload"
          className={`block relative cursor-pointer ${isDragging ? 'scale-[1.01]' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
          }`}>
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your PDF here
            </h3>
            <p className="text-gray-500 mb-6">
              or click to browse files
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md">
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
            className="hidden"
          />
        </label>
      </div>

      {/* Recent documents placeholder */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No documents yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload your first PDF to get started
          </p>
        </div>
      </div>
    </div>
  );
}
