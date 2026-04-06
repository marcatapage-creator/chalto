import { 
  DocumentThread, 
  DocumentVersion, 
  DocumentVersionStatus,
  AuditEvent
} from '../../models/v2/types';
import { 
  SubmitDocumentVersionCommand, 
  WithdrawDocumentVersionCommand 
} from '../../commands/v2/document-commands';
import { CommandResult } from '../../commands/v2/index';

/**
 * DocumentService V2 (Audit-First)
 * Refined as a Command Executor.
 */
export class DocumentServiceV2 {
  private threads: DocumentThread[] = [];
  private versions: DocumentVersion[] = [];
  private executedCommandIds: Set<string> = new Set();

  constructor(initialThreads: DocumentThread[] = [], initialVersions: DocumentVersion[] = []) {
    this.threads = [...initialThreads];
    this.versions = [...initialVersions];
  }

  /**
   * Executes SubmitDocumentVersionCommand.
   */
  public executeSubmitVersion(
    command: SubmitDocumentVersionCommand,
    threadId: string
  ): CommandResult<DocumentVersion> {
    
    // 1. Idempotency
    if (this.executedCommandIds.has(command.meta.commandId)) {
      return { ok: false, error: 'IDEMPOTENCY_CONFLICT', emittedEvents: [] };
    }

    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return { ok: false, error: 'ENTITY_NOT_FOUND', emittedEvents: [] };

    // 2. Domain Logic
    const threadVersions = this.versions.filter(v => v.threadId === thread.id);
    const versionNumber = threadVersions.length + 1;

    const version: DocumentVersion = {
      id: `ver-${Math.random().toString(36).substr(2, 9)}`,
      threadId: thread.id,
      versionNumber,
      storageKey: command.storageKey,
      fileHash: command.fileHash,
      lifecycleStatus: 'UPLOADED',
      createdAt: command.meta.issuedAt,
      createdBy: command.meta.actorId,
    };

    // 3. Record
    this.versions.push(version);
    this.executedCommandIds.add(command.meta.commandId);

    // 4. Emit Audit Event
    const event: AuditEvent = {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      projectId: thread.projectId,
      actorId: command.meta.actorId,
      timestamp: command.meta.issuedAt,
      action: 'UPLOAD',
      target: { type: 'DOCUMENT_THREAD', id: thread.id },
      context: { versionId: version.id, versionNumber }
    };

    return {
      ok: true,
      entity: version,
      emittedEvents: [event],
      idempotencyKey: command.meta.idempotencyKey
    };
  }

  /**
   * Creates a new logical document identity.
   */
  public createThread(
    projectId: string,
    title: string,
    createdBy: string,
    description?: string
  ): DocumentThread {
    const thread: DocumentThread = {
      id: `thr-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title,
      description,
      createdAt: new Date().toISOString(),
      createdBy,
    };
    this.threads.push(thread);
    return thread;
  }

  public getThread(id: string): DocumentThread | undefined {
    return this.threads.find(t => t.id === id);
  }

  public getVersionsByThread(threadId: string): DocumentVersion[] {
    return this.versions.filter(v => v.threadId === threadId);
  }
}

export const documentServiceV2 = new DocumentServiceV2();
