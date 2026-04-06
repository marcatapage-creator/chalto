import { 
  Assignment, 
  ReviewRequest, 
  Decision, 
  NextActionCandidate,
  AssignmentType
} from '../../models/v2/types';

/**
 * NextActionEngine V2 (Audit-First)
 * Pure projection engine based on explicit responsibilities and events.
 */
export function computeNextActions(
  userId: string,
  assignments: Assignment[],
  reviewRequests: ReviewRequest[],
  decisions: Decision[],
  now: Date = new Date()
): NextActionCandidate[] {
  
  const candidates: NextActionCandidate[] = [];

  // 1. Process Active Assignments (Primary Source)
  const userAssignments = assignments.filter(a => a.userId === userId && a.status === 'OPEN');
  
  for (const assignment of userAssignments) {
    let priority: 'URGENT' | 'IMPORTANT' | 'INFO' = 'IMPORTANT';
    
    if (assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate);
      const diffMs = dueDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 0) priority = 'URGENT'; // Overdue
      else if (diffHours < 24) priority = 'URGENT'; // Less than 24h
      else if (diffHours < 72) priority = 'IMPORTANT';
      else priority = 'INFO';
    }

    candidates.push({
      type: assignment.assignmentType,
      priority,
      reason: `Assigné le ${new Date(assignment.createdAt).toLocaleDateString('fr-FR')}`,
      target: {
        type: assignment.targetType,
        id: assignment.targetId
      }
    });
  }

  // 2. Process Rejected Decisions (Corrective actions)
  // If a decision I was involved in (as creator of the version) is rejected, I must act.
  const rejectedDecisions = decisions.filter(d => d.outcome === 'REJECTED');
  for (const decision of rejectedDecisions) {
    // Note: In a real system, we'd check if the user is the original uploader.
    candidates.push({
      type: 'UPLOAD_REVISION',
      priority: 'URGENT',
      reason: `Décision de rejet : ${decision.rationale || 'Sans motif'}`,
      target: {
        type: 'DOC_THREAD',
        id: decision.requestId // Simplified for the demo
      }
    });
  }

  // 3. Process Pending Reviews (Silence detection)
  const pendingReviews = reviewRequests.filter(r => r.requestedTo === userId && r.status === 'OPEN');
  for (const request of pendingReviews) {
    const requestedAt = new Date(request.createdAt);
    const diffHours = (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60);

    let priority: 'URGENT' | 'IMPORTANT' | 'INFO' = 'INFO';
    let reason = "En attente de votre revue";

    if (diffHours > 72) {
      priority = 'URGENT';
      reason = "RETARD CRITIQUE : En attente depuis plus de 3 jours";
    } else if (diffHours > 48) {
      priority = 'IMPORTANT';
      reason = "IMPORTANT : En attente de revue depuis 48h";
    }

    candidates.push({
      type: 'RESPOND_TO_REVIEW',
      priority,
      reason,
      target: {
        type: 'REVIEW_REQUEST',
        id: request.id
      }
    });
  }

  // 4. Global Ranking
  return candidates.sort((a, b) => {
    const priorityWeight = { 'URGENT': 3, 'IMPORTANT': 2, 'INFO': 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
}
