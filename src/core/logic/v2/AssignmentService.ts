import { 
  Assignment, 
  AssignmentStatus, 
  AssignmentTargetType, 
  AssignmentType 
} from '../../models/v2/types';
import { canTransitionAssignment } from '../../models/v2/guards';

/**
 * AssignmentService V2 (Audit-First)
 * Orchestrates explicit responsibilities and deadlines.
 */
export class AssignmentServiceV2 {
  private assignments: Assignment[] = [];

  constructor(initialAssignments: Assignment[] = []) {
    this.assignments = [...initialAssignments];
  }

  /**
   * Assigns a responsibility to a user.
   */
  public createAssignment(
    userId: string,
    projectId: string,
    targetType: AssignmentTargetType,
    targetId: string,
    assignmentType: AssignmentType,
    dueDate?: string
  ): Assignment {
    
    const assignment: Assignment = {
      id: `asn-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      targetType,
      targetId,
      assignmentType,
      status: 'OPEN',
      dueDate,
      createdAt: new Date().toISOString(),
    };

    this.assignments.push(assignment);
    return assignment;
  }

  /**
   * Marks an assignment as completed.
   */
  public completeAssignment(assignmentId: string): Assignment {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    if (!canTransitionAssignment(assignment.status, 'COMPLETED')) {
      throw new Error(`Cannot complete assignment with status ${assignment.status}`);
    }

    assignment.status = 'COMPLETED';
    return assignment;
  }

  /**
   * Cancels an assignment.
   */
  public cancelAssignment(assignmentId: string): Assignment {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

    if (!canTransitionAssignment(assignment.status, 'CANCELLED')) {
      throw new Error(`Cannot cancel assignment with status ${assignment.status}`);
    }

    assignment.status = 'CANCELLED';
    return assignment;
  }

  public getAssignmentsByUser(userId: string): Assignment[] {
    return this.assignments.filter(a => a.userId === userId);
  }

  public getOpenAssignmentsByProject(projectId: string): Assignment[] {
    return this.assignments.filter(a => a.projectId === projectId && a.status === 'OPEN');
  }
}

export const assignmentServiceV2 = new AssignmentServiceV2();
