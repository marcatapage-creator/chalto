export type UserRole = 'ARCHITECT' | 'CLIENT' | 'CONTRACTOR';

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'REQUEST' | 'STUDY' | 'PROPOSAL' | 'VALIDATION' | 'EXECUTION' | 'CLOSURE';


export type ProjectType = 'EXTENSION' | 'RENOVATION' | 'CONSTRUCTION' | 'AMENAGEMENT';

export type Priority = 'URGENT' | 'IMPORTANT' | 'INFO' | 'WARNING';

export interface NextAction {
  label: string;
  type: 'SYSTEM' | 'MANUAL' | 'VALIDATION';
  priority: Priority;
  description?: string;
  dueDate?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  incompleteProfile: boolean;
  createdAt: string;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  order: number;
  status: 'TODO' | 'DOING' | 'DONE';
}

export interface ProjectMember {
  id: string;
  userId: string;
  role: UserRole;
  name: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  versionNumber: number;
  isLatest: boolean;
  fileHash?: string; // SHA-256 for integrity
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  visibility: UserRole[];
  uploadedBy: string;
  uploadedAt: string;
  stage: ProjectStatus;
}

export type ValidationStatus = 'pending' | 'viewed' | 'approved' | 'rejected';

export interface ValidationRequest {
  id: string;
  documentId: string;
  documentVersionNumber: number;
  status: ValidationStatus;
  requestedAt: string;
  expiresAt: string; // Token-level expiration
  viewedAt?: string;
  respondedAt?: string;
  feedback?: string;
  context?: string; 
  requestedBy: string; 
  requestedTo: string; 
}

export type ActivityType = 'DOC_UPLOAD' | 'VALIDATION_REQ' | 'VALIDATION_RES' | 'STAGE_CHANGE' | 'COMMENT';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  action: string; 
  humanLabel: string; 
  timestamp: string;
  visibility: UserRole[];
  metadata?: any;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  address?: string;
  clientId: string;
  clientName: string; // Re-denormalized for convenience
  createdBy: string; // Architect ID
  status: ProjectStatus;
  members: ProjectMember[];
  phases: Phase[];
  nextActionOverride?: NextAction;
  nextActionOverrideSetAt?: string;
  statusChangedAt: string; 
  clientPortalToken?: string; 
  portalTokenExpiresAt?: string; // Security: 30-day lifespan
  createdAt: string;
  updatedAt: string;
}

