'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { DocumentRecord, Annotation } from '@/lib/storage/documents';

interface DocumentContextType {
  documents: DocumentRecord[];
  loading: boolean;
  error: string | null;
  totalDocuments: number;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, name?: string, pageCount?: number) => Promise<DocumentRecord>;
  updateDocument: (id: string, updates: { name?: string; status?: string; annotations?: Annotation[] }) => Promise<DocumentRecord>;
  deleteDocument: (id: string) => Promise<void>;
  getDocumentWithUrl: (id: string) => Promise<{ document: DocumentRecord; downloadUrl: string }>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents);
      setTotalDocuments(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, name?: string, pageCount?: number): Promise<DocumentRecord> => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (pageCount) formData.append('pageCount', pageCount.toString());

    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to upload document');
    }

    const data = await response.json();
    setDocuments(prev => [data.document, ...prev]);
    setTotalDocuments(prev => prev + 1);
    return data.document;
  }, []);

  const updateDocument = useCallback(async (
    id: string,
    updates: { name?: string; status?: string; annotations?: Annotation[] }
  ): Promise<DocumentRecord> => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update document');
    }

    const data = await response.json();
    setDocuments(prev => prev.map(doc => doc.id === id ? data.document : doc));
    return data.document;
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete document');
    }

    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setTotalDocuments(prev => prev - 1);
  }, []);

  const getDocumentWithUrl = useCallback(async (id: string): Promise<{ document: DocumentRecord; downloadUrl: string }> => {
    const response = await fetch(`/api/documents/${id}`);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get document');
    }

    return await response.json();
  }, []);

  return (
    <DocumentContext.Provider value={{
      documents,
      loading,
      error,
      totalDocuments,
      fetchDocuments,
      uploadDocument,
      updateDocument,
      deleteDocument,
      getDocumentWithUrl,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
