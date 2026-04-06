import { useState } from 'react';
import { CommandResult } from '../../commands/v2/index';
import { getHumanMessage } from '../../logic/v2/DomainErrorMap';

/**
 * useCommand Hook
 * Orchestrates the execution of a V2 domain command in the UI.
 */
export function useCommand<T, Args extends any[]>(
  commandExecutor: (...args: Args) => CommandResult<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const execute = async (...args: Args): Promise<CommandResult<T> | null> => {
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      // In a real system, this would be an async call to a BFF/API
      const result = commandExecutor(...args);

      if (!result.ok && result.error) {
        setError(getHumanMessage(result.error));
      }

      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings.map(getHumanMessage));
      }

      return result;
    } catch (e) {
      setError("Une erreur inattendue est survenue lors de l'exécution de la commande.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error,
    warnings
  };
}
