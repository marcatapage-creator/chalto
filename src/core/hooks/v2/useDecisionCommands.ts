import { decisionServiceV2 } from '../../logic/v2/DecisionService';
import { useCommand } from './useCommand';
import { RecordDecisionCommand, SupersedeDecisionCommand } from '../../commands/v2/decision-commands';
import { ReviewRequest } from '../../models/v2/types';

/**
 * useDecisionCommands
 * Orchestrates decision-related mutations via V2 Commands.
 */
export function useDecisionCommands() {
  
  const recordDecision = useCommand(
    (command: RecordDecisionCommand, request: ReviewRequest) => 
      decisionServiceV2.executeRecordDecision(command, request)
  );

  // Future: supersedeDecision, etc.

  return {
    recordDecision
  };
}
