import { reviewServiceV2 } from '../../logic/v2/ReviewService';
import { useCommand } from './useCommand';
import { RequestReviewCommand, CancelReviewRequestCommand } from '../../commands/v2/document-commands';
import { DocumentVersion } from '../../models/v2/types';

/**
 * useReviewCommands
 * Orchestrates review-related mutations via V2 Commands.
 */
export function useReviewCommands() {
  
  const requestReview = useCommand(
    (command: RequestReviewCommand, version: DocumentVersion) => 
      reviewServiceV2.executeRequestReview(command, version)
  );

  // Future: cancelReview, etc.

  return {
    requestReview
  };
}
