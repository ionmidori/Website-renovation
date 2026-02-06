import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { fetchWithAuth } from '@/lib/api-client';

export interface DocumentUploadState {
    id: string;
    file: File;
    fileName: string;
    fileSize: number;
    mimeType: string;
    status: 'idle' | 'uploading' | 'done' | 'error';
    progress: number;
    publicUrl?: string;
    errorMessage?: string;
}

const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain',
    'text/csv',
];

const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Custom hook for document upload management.
 * Uploads documents to Python backend -> Firebase Storage.
 */
export function useDocumentUpload(sessionId?: string) {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<DocumentUploadState[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Upload a single document to the backend.
     */
    const uploadDocument = async (doc: DocumentUploadState): Promise<string> => {
        try {
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, status: 'uploading' as const, progress: 10 } : d
            ));

            const formData = new FormData();
            formData.append('file', doc.file);
            if (sessionId) {
                formData.append('session_id', sessionId);
            }

            // Use the Python backend upload endpoint
            const response = await fetchWithAuth('/api/py/upload/document', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Upload failed');
            }

            const result = await response.json();
            const publicUrl = result.public_url || result.url;

            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? {
                    ...d,
                    status: 'done' as const,
                    progress: 100,
                    publicUrl
                } : d
            ));

            console.log(`[Document Upload] ✅ Uploaded: ${doc.fileName}`);
            return publicUrl;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? {
                    ...d,
                    status: 'error' as const,
                    errorMessage
                } : d
            ));
            throw error;
        }
    };

    /**
     * Add document files and start upload process.
     */
    const addDocuments = useCallback(async (files: File[]): Promise<string[]> => {
        if (!files.length) return [];

        // Validate files
        const validFiles: File[] = [];
        for (const file of files) {
            if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
                console.warn(`[Document Upload] Skipped unsupported type: ${file.type}`);
                continue;
            }
            if (file.size > MAX_DOCUMENT_SIZE) {
                console.warn(`[Document Upload] Skipped too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                continue;
            }
            validFiles.push(file);
        }

        if (!validFiles.length) {
            throw new Error('No valid documents to upload');
        }

        setIsUploading(true);

        // Create document states
        const newDocs: DocumentUploadState[] = validFiles.map(file => ({
            id: Math.random().toString(36).substring(2, 9),
            file,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            status: 'idle' as const,
            progress: 0
        }));

        setDocuments(prev => [...prev, ...newDocs]);

        try {
            // Upload all documents in parallel
            const urls = await Promise.all(
                newDocs.map(doc => uploadDocument(doc))
            );
            return urls;
        } catch (error) {
            console.error('[useDocumentUpload] Upload failed:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [sessionId]);

    const removeDocument = useCallback((id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    }, []);

    const clearDocuments = useCallback(() => {
        setDocuments([]);
    }, []);

    return {
        documents,
        addDocuments,
        removeDocument,
        clearDocuments,
        isUploading
    };
}
