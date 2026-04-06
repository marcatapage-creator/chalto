import { useMemo } from 'react';
import { Project as ProjectV1, Document as DocumentV1 } from '../../types';
import { migrateProjectV1ToV2 } from '../../logic/v2/migration';
import { computeNextActions } from '../../logic/v2/NextActionEngine';
import { auditTrailGeneratorV2 } from '../../logic/v2/AuditTrailGenerator';

/**
 * useProjectV2 Hook (The Bridge)
 * Bridges V1 data to V2 Audit-First logic.
 */
export function useProjectV2(
  projectV1: ProjectV1,
  documentsV1: DocumentV1[],
  userId: string
) {
  
  // 1. Memoized Migration (V1 -> V2)
  const v2Context = useMemo(() => {
    return migrateProjectV1ToV2(projectV1, documentsV1);
  }, [projectV1, documentsV1]);

  // 2. Memoized Next Actions Projection
  const nextActions = useMemo(() => {
    return computeNextActions(
      userId,
      [], // No assignments in V1 yet
      v2Context.requests,
      v2Context.decisions
    );
  }, [userId, v2Context]);

  // 3. Timeline / Audit Projections
  const threadHistories = useMemo(() => {
    return v2Context.threads.map(thread => ({
      thread,
      history: auditTrailGeneratorV2.generateThreadHistory(
        thread.id,
        v2Context.versions,
        v2Context.requests,
        v2Context.decisions,
        [] // No pure system events yet
      )
    }));
  }, [v2Context]);

  return {
    v2Context,
    nextActions,
    threadHistories,
    migrationReport: v2Context.report
  };
}
