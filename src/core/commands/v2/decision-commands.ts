import { 
  BaseCommand, 
  CommandResult 
} from './index';
import { 
  Decision, 
  DecisionOutcome, 
  DecisionAuthority 
} from '../../models/v2/types';

/**
 * RecordDecisionCommand
 * The most sensitive contractual command.
 */
export interface RecordDecisionCommand extends BaseCommand {
  requestId: string;
  outcome: DecisionOutcome;
  authority: DecisionAuthority;
  rationale?: string;
  supersedesDecisionId?: string;
}

/**
 * SupersedeDecisionCommand
 * Explicitly replaces a previous decision truth.
 */
export interface SupersedeDecisionCommand extends BaseCommand {
  oldDecisionId: string;
  newOutcome: DecisionOutcome;
  newRationale: string;
}
