import { 
  BaseCommand, 
  CommandResult 
} from './index';

/**
 * SubmitDocumentVersionCommand
 * Represents the intention to upload and share a new version.
 */
export interface SubmitDocumentVersionCommand extends BaseCommand {
  threadId: string;
  storageKey: string;
  fileHash: string;
}

/**
 * RequestReviewCommand
 */
export interface RequestReviewCommand extends BaseCommand {
  versionId: string;
  projectId: string;
  requestedTo: string;
  deadlineAt?: string;
}

/**
 * WithdrawDocumentVersionCommand
 */
export interface WithdrawDocumentVersionCommand extends BaseCommand {
  versionId: string;
}

/**
 * CancelReviewRequestCommand
 */
export interface CancelReviewRequestCommand extends BaseCommand {
  requestId: string;
}
