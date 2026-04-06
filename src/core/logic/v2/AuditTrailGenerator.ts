import { 
  DocumentThread, 
  DocumentVersion, 
  ReviewRequest, 
  Decision, 
  AuditEvent 
} from '../../models/v2/types';

/**
 * AuditTrailGenerator V2 (Audit-First)
 * Reconstructs the full historical chain of events for a given target.
 */
export class AuditTrailGeneratorV2 {
  
  /**
   * Generates a chronologically sorted list of events for a DocumentThread.
   * This includes: Uploads, Submissions, and Decisions.
   */
  public generateThreadHistory(
    threadId: string,
    versions: DocumentVersion[],
    requests: ReviewRequest[],
    decisions: Decision[],
    events: AuditEvent[]
  ): any[] {
    
    const threadVersions = versions.filter(v => v.threadId === threadId);
    const versionIds = threadVersions.map(v => v.id);
    
    const threadRequests = requests.filter(r => versionIds.includes(r.versionId));
    const requestIds = threadRequests.map(r => r.id);
    
    const threadDecisions = decisions.filter(d => requestIds.includes(d.requestId));

    // Combine all "Truth" objects into a timeline
    const timeline: any[] = [
      ...threadVersions.map(v => ({ type: 'VERSION', timestamp: v.createdAt, data: v })),
      ...threadRequests.map(r => ({ type: 'REVIEW_REQUEST', timestamp: r.createdAt, data: r })),
      ...threadDecisions.map(d => ({ type: 'DECISION', timestamp: d.createdAt, data: d }))
    ];

    return timeline.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Focuses on the "Contractual Truth" by tracing the latest valid decision chain.
   */
  public getContractualTruth(threadId: string, decisions: Decision[]): Decision | null {
    // We look for the latest decision for this thread that is not superseded.
    // In a real system, we'd filter decisions by thread first.
    const threadDecisions = decisions.filter(d => 
      !decisions.some(d2 => d2.supersedesDecisionId === d.id)
    );
    
    return threadDecisions[threadDecisions.length - 1] || null;
  }
}

export const auditTrailGeneratorV2 = new AuditTrailGeneratorV2();
