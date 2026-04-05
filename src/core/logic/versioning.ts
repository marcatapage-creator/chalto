import { Document, ProjectStatus } from '../types';

/**
 * Versioning Logic:
 * Detects if a new file should be a new version of an existing document.
 */
export function detectVersionCandidate(
  fileName: string, 
  stage: ProjectStatus, 
  existingDocs: Document[]
): Document | null {
  // Simple heuristic: Same name (ignoring extension) and same stage
  const baseName = fileName.split('.').slice(0, -1).join('.');
  
  return existingDocs.find(doc => {
    const docBaseName = doc.name.split('.').slice(0, -1).join('.');
    return docBaseName.toLowerCase() === baseName.toLowerCase() && doc.stage === stage;
  }) || null;
}

export function createNewVersion(existingDoc: Document, newUrl: string): Document {
  return {
    ...existingDoc,
    url: newUrl,
    versionNumber: existingDoc.versionNumber + 1,
    isLatest: true,
    status: 'DRAFT',
    uploadedAt: new Date().toISOString(),
  };
}
