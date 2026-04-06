import { AuditEvent } from '../../models/v2/types';

/**
 * Chalto V2 Command Infrastructure
 */

export type CommandSource = 'UI' | 'SYSTEM_MIGRATION' | 'SYSTEM_INTERNAL';

export interface CommandMeta {
  commandId: string;
  actorId: string;
  issuedAt: string;
  source: CommandSource;
  idempotencyKey?: string;
}

export type DomainError = 
  | 'REVIEW_REQUEST_ALREADY_DECIDED'
  | 'DOCUMENT_VERSION_ALREADY_WITHDRAWN'
  | 'DECISION_SCOPE_MISMATCH'
  | 'INVALID_SUPERSESSION_TARGET'
  | 'IDEMPOTENCY_CONFLICT'
  | 'UNAUTHORIZED_ACTION'
  | 'ENTITY_NOT_FOUND';

export type DomainWarning = 
  | 'LATEST_VERSION_ALREADY_EXISTS'
  | 'MISSING_OPTIONAL_RATIONALE';

export interface CommandResult<T> {
  ok: boolean;
  entity?: T;
  emittedEvents: AuditEvent[];
  warnings?: DomainWarning[];
  error?: DomainError;
  idempotencyKey?: string;
}

export interface BaseCommand {
  meta: CommandMeta;
}
