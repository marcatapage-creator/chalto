import { 
  Decision, 
  DecisionOutcome, 
  DecisionAuthority, 
  ReviewRequest,
  AuditEvent
} from '../../models/v2/types';
import { 
  RecordDecisionCommand, 
  SupersedeDecisionCommand 
} from '../../commands/v2/decision-commands';
import { CommandResult, DomainError } from '../../commands/v2/index';

/**
 * DecisionService V2 (Audit-First)
 * Refined as a Command Executor.
 */
export class DecisionServiceV2 {
  private decisions: Decision[] = [];
  private executedCommandIds: Set<string> = new Set();

  constructor(initialDecisions: Decision[] = []) {
    this.decisions = [...initialDecisions];
  }

  /**
   * Executes RecordDecisionCommand.
   */
  public executeRecordDecision(
    command: RecordDecisionCommand,
    request: ReviewRequest
  ): CommandResult<Decision> {
    
    // 1. Idempotency Check
    if (this.executedCommandIds.has(command.meta.commandId)) {
      return { ok: false, error: 'IDEMPOTENCY_CONFLICT', emittedEvents: [] };
    }

    // 2. Pre-condition: Request must be OPEN
    if (request.status !== 'OPEN') {
      return { ok: false, error: 'REVIEW_REQUEST_ALREADY_DECIDED', emittedEvents: [] };
    }

    // 3. Domain Logic
    const decision: Decision = {
      id: `dec-${Math.random().toString(36).substr(2, 9)}`,
      requestId: command.requestId,
      outcome: command.outcome,
      authority: command.authority,
      rationale: command.rationale,
      supersedesDecisionId: command.supersedesDecisionId,
      decidedBy: command.meta.actorId,
      createdAt: command.meta.issuedAt,
    };

    // 4. Record & Mark Idempotency
    this.decisions.push(decision);
    this.executedCommandIds.add(command.meta.commandId);

    // 5. Emit Audit Event
    const event: AuditEvent = {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      projectId: request.projectId,
      actorId: command.meta.actorId,
      timestamp: command.meta.issuedAt,
      action: 'DECIDE',
      target: { type: 'REVIEW_REQUEST', id: request.id },
      context: { outcome: command.outcome, decisionId: decision.id }
    };

    return {
      ok: true,
      entity: decision,
      emittedEvents: [event],
      idempotencyKey: command.meta.idempotencyKey
    };
  }

  /**
   * Reconstructs the audit chain for a decision.
   */
  public getDecisionHistory(decisionId: string): Decision[] {
    const chain: Decision[] = [];
    let current = this.decisions.find(d => d.id === decisionId);
    
    while (current) {
      chain.unshift(current);
      if (current.supersedesDecisionId) {
        current = this.decisions.find(d => d.id === current?.supersedesDecisionId);
      } else {
        break;
      }
    }
    
    return chain;
  }
}

export const decisionServiceV2 = new DecisionServiceV2();
