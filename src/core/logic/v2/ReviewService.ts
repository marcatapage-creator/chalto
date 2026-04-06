import { 
  ReviewRequest, 
  DocumentVersion,
  AuditEvent
} from '../../models/v2/types';
import { 
  RequestReviewCommand, 
  CancelReviewRequestCommand 
} from '../../commands/v2/document-commands';
import { CommandResult } from '../../commands/v2/index';

/**
 * ReviewService V2 (Audit-First)
 * Refined as a Command Executor.
 */
export class ReviewServiceV2 {
  private requests: ReviewRequest[] = [];
  private executedCommandIds: Set<string> = new Set();

  constructor(initialRequests: ReviewRequest[] = []) {
    this.requests = [...initialRequests];
  }

  /**
   * Executes RequestReviewCommand.
   */
  public executeRequestReview(
    command: RequestReviewCommand,
    version: DocumentVersion
  ): CommandResult<ReviewRequest> {
    
    // 1. Idempotency
    if (this.executedCommandIds.has(command.meta.commandId)) {
      return { ok: false, error: 'IDEMPOTENCY_CONFLICT', emittedEvents: [] };
    }

    // 2. Pre-condition: Version must be UPLOADED
    if (version.lifecycleStatus !== 'UPLOADED') {
      return { ok: false, error: 'DOCUMENT_VERSION_ALREADY_WITHDRAWN', emittedEvents: [] };
    }

    // 3. Domain Logic
    const request: ReviewRequest = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      versionId: command.versionId,
      projectId: command.projectId,
      status: 'OPEN',
      requestedBy: command.meta.actorId,
      requestedTo: command.requestedTo,
      deadlineAt: command.deadlineAt,
      createdAt: command.meta.issuedAt,
    };

    // 4. Record
    this.requests.push(request);
    this.executedCommandIds.add(command.meta.commandId);

    // 5. Emit Audit Event
    const event: AuditEvent = {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      projectId: command.projectId,
      actorId: command.meta.actorId,
      timestamp: command.meta.issuedAt,
      action: 'SUBMIT',
      target: { type: 'DOCUMENT_VERSION', id: version.id },
      context: { requestId: request.id, requestedTo: command.requestedTo }
    };

    return {
      ok: true,
      entity: request,
      emittedEvents: [event],
      idempotencyKey: command.meta.idempotencyKey
    };
  }

  /**
   * Updates status to DECIDED (Internal use by DecisionService).
   */
  public markAsDecided(requestId: string): void {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'DECIDED';
    }
  }

  public getRequest(id: string): ReviewRequest | undefined {
    return this.requests.find(r => r.id === id);
  }
}

export const reviewServiceV2 = new ReviewServiceV2();
