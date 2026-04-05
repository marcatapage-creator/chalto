export type UserRole = 'ARCHITECT' | 'CLIENT' | 'CONTRACTOR';

export type ProjectStatus = 'REQUEST' | 'STUDY' | 'PROPOSAL' | 'VALIDATION' | 'EXECUTION' | 'CLOSURE';

export type Priority = 'URGENT' | 'IMPORTANT' | 'INFO' | 'WARNING';

export interface NextAction {
  label: string;
  type: 'SYSTEM' | 'MANUAL' | 'VALIDATION';
  priority: Priority;
  description?: string;
  dueDate?: string;
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
  fileHash?: string;
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
  viewedAt?: string;
  respondedAt?: string;
  feedback?: string;
  context?: string; // What this validation means (e.g. "Aménagement cuisine")
  requestedBy: string; // projectMemberId
  requestedTo: string; // projectMemberId (usually client)
}

export type ActivityType = 'DOC_UPLOAD' | 'VALIDATION_REQ' | 'VALIDATION_RES' | 'STAGE_CHANGE' | 'COMMENT';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  action: string; // Technical log
  humanLabel: string; // Storytelling label (FR)
  timestamp: string;
  visibility: UserRole[];
  metadata?: any;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  address: string;
  status: ProjectStatus;
  members: ProjectMember[];
  nextActionOverride?: NextAction;
  nextActionOverrideSetAt?: string;
  statusChangedAt: string; // For aging logic
  clientPortalToken?: string; 
  createdAt: string;
  updatedAt: string;
}
