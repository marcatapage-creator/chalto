import { Document, ValidationRequest, Project } from '../types';

/**
 * Project Lifecycle Rules for Chalto Pro:
 * - Handling Version Conflicts
 * - Approval Chain Rules
 */

export interface VersionStatus {
  isCompromised: boolean;
  hasNewerVersion: boolean;
  canBeValidated: boolean;
  reason?: string;
}

/**
 * Detects if a document version is safe to validate or if it's "Historical".
 */
export function getDocumentVersionContext(
  doc: Document,
  allDocuments: Document[]
): VersionStatus {
  const newerVersions = allDocuments.filter(
    d => d.name === doc.name && d.versionNumber > doc.versionNumber
  );

  if (newerVersions.length > 0) {
    return {
      isCompromised: false,
      hasNewerVersion: true,
      canBeValidated: true, // You can still validate a past version (Contractual)
      reason: "Une version plus récente existe déjà."
    };
  }

  return {
    isCompromised: false,
    hasNewerVersion: false,
    canBeValidated: true
  };
}

/**
 * Resolves the global project state after a validation.
 * Ensures that approving an old version doesn't "Rollback" the active working phase.
 */
export function resolveProjectStateAfterValidation(
  project: Project,
  validation: ValidationRequest,
  document: Document
): Partial<Project> {
  const isOldVersion = !document.isLatest;
  
  if (isOldVersion && validation.status === 'approved') {
    // Contractual Approval of a past version.
    // Does NOT advance the project stage, but updates the record.
    return {
      updatedAt: new Date().toISOString(),
    };
  }

  if (document.isLatest && validation.status === 'approved') {
    // Standard Approval of the latest version.
    // Potential to advance the project stage.
    return {
      statusChangedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    updatedAt: new Date().toISOString(),
  };
}
