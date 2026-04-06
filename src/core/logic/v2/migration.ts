import { Document as DocumentV1, Project as ProjectV1 } from '../../types';
import { 
  DocumentThread, 
  DocumentVersion, 
  ReviewRequest, 
  Decision, 
  AuditEvent,
  DecisionOutcome
} from '../../models/v2/types';

/**
 * Migration Interprétative V1 -> V2
 */

export interface MigrationAnomaly {
  entityId: string;
  type: 'MISSING_ACTOR' | 'INFERRED_DATE' | 'MISSING_VERSION' | 'STATUS_AMBIGUITY';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MigrationReport {
  timestamp: string;
  totalConverted: number;
  inferredDecisions: number;
  anomalies: MigrationAnomaly[];
}

export interface MigrationResult {
  threads: DocumentThread[];
  versions: DocumentVersion[];
  requests: ReviewRequest[];
  decisions: Decision[];
  report: MigrationReport;
}

/**
 * Migration Logic
 */
export function migrateProjectV1ToV2(
  projectV1: ProjectV1, 
  documentsV1: DocumentV1[]
): MigrationResult {
  
  const result: MigrationResult = {
    threads: [],
    versions: [],
    requests: [],
    decisions: [],
    report: {
      timestamp: new Date().toISOString(),
      totalConverted: 0,
      inferredDecisions: 0,
      anomalies: []
    }
  };

  for (const docV1 of documentsV1) {
    result.report.totalConverted++;

    // 1. Thread Creation
    const thread: DocumentThread = {
      id: `thr-${docV1.id}`,
      projectId: projectV1.id,
      title: docV1.name,
      createdAt: docV1.uploadedAt,
      createdBy: docV1.uploadedBy || 'SYSTEM_MIGRATION'
    };
    result.threads.push(thread);

    // 2. Initial Version Creation
    const version: DocumentVersion = {
      id: `ver-${docV1.id}-initial`,
      threadId: thread.id,
      versionNumber: docV1.versionNumber || 1,
      storageKey: docV1.url,
      fileHash: `mig-hash-${docV1.id}`, // Placeholder
      lifecycleStatus: 'UPLOADED',
      createdAt: docV1.uploadedAt,
      createdBy: docV1.uploadedBy || 'SYSTEM_MIGRATION'
    };
    result.versions.push(version);

    // 3. Status Transformation (Reconstruction of Intent & Decision)
    if (docV1.status !== 'DRAFT') {
      // Inferred Intent
      const request: ReviewRequest = {
        id: `req-mig-${docV1.id}`,
        versionId: version.id,
        projectId: projectV1.id,
        status: docV1.status === 'PENDING' ? 'OPEN' : 'DECIDED',
        requestedBy: thread.createdBy,
        requestedTo: projectV1.clientId || 'SYSTEM_MIGRATION',
        createdAt: docV1.uploadedAt
      };
      result.requests.push(request);

      if (docV1.status === 'APPROVED' || docV1.status === 'REJECTED') {
        // Inferred Decision
        const outcome: DecisionOutcome = docV1.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
        const decision: Decision = {
          id: `dec-mig-${docV1.id}`,
          requestId: request.id,
          outcome: outcome,
          authority: 'CONTRACTUAL',
          rationale: '[MIGRATION] Décision importée du système V1',
          decidedBy: projectV1.clientId || 'SYSTEM_MIGRATION',
          createdAt: docV1.uploadedAt // Use upload date as decision date (Anomaly)
        };
        result.decisions.push(decision);
        result.report.inferredDecisions++;

        // Audit trace of anomaly
        result.report.anomalies.push({
          entityId: docV1.id,
          type: 'INFERRED_DATE',
          message: `Date de décision absente en V1 : utilisation de la date d'upload par défaut.`,
          severity: 'LOW'
        });
      }
    }

    // 4. Anomaly Check: Missing Author
    if (!docV1.uploadedBy) {
      result.report.anomalies.push({
        entityId: docV1.id,
        type: 'MISSING_ACTOR',
        message: `Auteur de l'upload inconnu en V1 : marqué SYSTEM_MIGRATION.`,
        severity: 'MEDIUM'
      });
    }
  }

  return result;
}
