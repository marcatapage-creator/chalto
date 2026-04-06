import { 
  ReviewRequestStatus, 
  DocumentVersionStatus, 
  AssignmentStatus 
} from './types';

/**
 * Audit-First State Machine Guards
 * Prevents invalid transitions in the business model.
 */

// --- ReviewRequest Guards ---

export const VALID_REVIEW_REQUEST_TRANSITIONS: Record<ReviewRequestStatus, ReviewRequestStatus[]> = {
  'OPEN': ['DECIDED', 'EXPIRED', 'CANCELLED'],
  'DECIDED': [],    // Terminal
  'EXPIRED': [],    // Terminal
  'CANCELLED': []   // Terminal
};

export function canTransitionReviewRequest(
  from: ReviewRequestStatus, 
  to: ReviewRequestStatus
): boolean {
  return VALID_REVIEW_REQUEST_TRANSITIONS[from].includes(to);
}

// --- DocumentVersion Guards ---

export const VALID_DOCUMENT_VERSION_TRANSITIONS: Record<DocumentVersionStatus, DocumentVersionStatus[]> = {
  'UPLOADED': ['WITHDRAWN', 'ARCHIVED'],
  'WITHDRAWN': [],  // Terminal
  'ARCHIVED': []    // Terminal
};

export function canTransitionDocumentVersion(
  from: DocumentVersionStatus, 
  to: DocumentVersionStatus
): boolean {
  return VALID_DOCUMENT_VERSION_TRANSITIONS[from].includes(to);
}

// --- Assignment Guards ---

export const VALID_ASSIGNMENT_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  'OPEN': ['COMPLETED', 'EXPIRED', 'CANCELLED'],
  'COMPLETED': [],  // Terminal
  'EXPIRED': [],    // Terminal
  'CANCELLED': []   // Terminal
};

export function canTransitionAssignment(
  from: AssignmentStatus, 
  to: AssignmentStatus
): boolean {
  return VALID_ASSIGNMENT_TRANSITIONS[from].includes(to);
}
