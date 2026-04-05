import { Document, ProjectStatus, UserRole } from '../types';

export interface StorageProvider {
  uploadFile(file: File, metadata: {
    projectId: string;
    uploadedBy: string;
    stage: ProjectStatus;
    visibility: UserRole[];
  }): Promise<Document>;
  
  deleteFile(documentId: string): Promise<void>;
  
  getFileUrl(documentId: string): string;
}

/**
 * Local File System Implementation (MVP)
 * For local development, we'll store files in public/uploads.
 * This can be easily swapped for S3/Supabase Storage.
 */
export class LocalStorageProvider implements StorageProvider {
  async uploadFile(file: File, metadata: any): Promise<Document> {
    // Note: This logic will be implemented in a Next.js API route 
    // to have access to the file system.
    // This is just the client-side representation.
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response.json();
  }

  async deleteFile(documentId: string): Promise<void> {
    await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  getFileUrl(documentId: string): string {
    return `/uploads/${documentId}`;
  }
}
