/**
 * Chalto V2 Canon (Audit-First)
 * Project: Architect's Copilot
 */

// --- Project & Members ---

export type ProjectRole = 'ARCHITECT' | 'CLIENT' | 'CO_CLIENT' | 'CONTRACTOR';

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: string;
}

export type ProjectStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'STUDY' 
  | 'PROPOSAL' 
  | 'VALIDATION' 
  | 'EXECUTION' 
  | 'CLOSURE';

// --- Document Management ---

export interface DocumentThread {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

export type DocumentVersionStatus = 'UPLOADED' | 'WITHDRAWN' | 'ARCHIVED';

export interface DocumentVersion {
  id: string;
  threadId: string;
  versionNumber: number; // Sequence relative to thread
  storageKey: string;    // Blob storage path
  fileHash: string;      // Integrity check
  lifecycleStatus: DocumentVersionStatus;
  createdAt: string;
  createdBy: string;
}

// --- Review & Decision Engine ---

export type ReviewRequestStatus = 'OPEN' | 'DECIDED' | 'EXPIRED' | 'CANCELLED';

export interface ReviewRequest {
  id: string;
  versionId: string;
  projectId: string;
  status: ReviewRequestStatus;
  requestedTo: string; // Target User or Group ID
  requestedBy: string;
  deadlineAt?: string;
  createdAt: string;
}

export type DecisionOutcome = 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'ACKNOWLEDGED';

export type DecisionAuthority = 'CONTRACTUAL' | 'ADVISORY' | 'INTERNAL';

export interface Decision {
  id: string;
  requestId: string;
  outcome: DecisionOutcome;
  authority: DecisionAuthority;
  rationale?: string;           // Explanatory text for audit
  supersedesDecisionId?: string; // Chain link for "Change of Mind"
  decidedBy: string;
  createdAt: string;
}

// --- Responsibility & Assignments ---

export type AssignmentTargetType = 'PROJECT' | 'DOC_THREAD' | 'REVIEW_REQUEST';

export type AssignmentType = 
  | 'PROJECT_FOLLOW_UP' 
  | 'PREPARE_DOCUMENT' 
  | 'RESPOND_TO_REVIEW' 
  | 'UPLOAD_REVISION' 
  | 'VALIDATE_PHASE';

export type AssignmentStatus = 'OPEN' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface Assignment {
  id: string;
  userId: string;
  projectId: string;
  targetType: AssignmentTargetType;
  targetId: string;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  dueDate?: string;
  createdAt: string;
}

// --- Activity & Audit ---

export type ActivityAction = 
  | 'UPLOAD' 
  | 'SUBMIT' 
  | 'DECIDE' 
  | 'ASSIGN' 
  | 'ADVANCE_PHASE' 
  | 'WITHDRAW' 
  | 'CANCEL';

export interface AuditEvent {
  id: string;
  projectId: string;
  actorId: string;
  timestamp: string;
  action: ActivityAction;
  target: {
    type: string;
    id: string;
  };
  context: any; // Structured metadata (versionNumber, outcome, etc.)
}

// --- Engine Projection (Derived) ---

export interface NextActionCandidate {
  type: AssignmentType | 'URGENT_CORRECTION';
  priority: 'URGENT' | 'IMPORTANT' | 'INFO';
  reason: string;
  target: {
    type: AssignmentTargetType;
    id: string;
  };
}
