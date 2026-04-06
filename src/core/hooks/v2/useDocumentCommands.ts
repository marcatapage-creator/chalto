import { documentServiceV2 } from '../../logic/v2/DocumentService';
import { useCommand } from './useCommand';
import { SubmitDocumentVersionCommand } from '../../commands/v2/document-commands';

/**
 * useDocumentCommands
 * Orchestrates document-related mutations via V2 Commands.
 */
export function useDocumentCommands() {
  
  const submitVersion = useCommand(
    (command: SubmitDocumentVersionCommand, threadId: string) => 
      documentServiceV2.executeSubmitVersion(command, threadId)
  );

  // Future: withdrawVersion, etc.

  return {
    submitVersion
  };
}
