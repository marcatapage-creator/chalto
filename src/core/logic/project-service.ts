import { Project, ProjectType, Client } from '../types';
import { projectRepository } from '../storage/project-repository';
import { clientRepository } from '../storage/client-repository';
import { getPhasesForType } from './phase-resolver';

export interface CreateProjectInput {
  name: string;
  clientEmail: string;
  type: ProjectType;
  address?: string;
  createdBy: string;
}

export class ProjectService {
  async initiateProject(input: CreateProjectInput): Promise<Project> {
    // 1. Resolve Client
    let client = await clientRepository.findByEmail(input.clientEmail);
    
    if (!client) {
      // Create minimal client with incompleteProfile = true
      client = await clientRepository.create({
        name: 'Client à compléter',
        email: input.clientEmail,
        incompleteProfile: true,
      });
    }

    const projectId = `prj-${Math.random().toString(36).substr(2, 9)}`;

    // 2. Resolve Phases
    const phaseTemplates = getPhasesForType(projectId, input.type);
    const phases = phaseTemplates.map((p, i) => ({
      ...p,
      id: `ph-${projectId}-${i}`,
      projectId,
    }));

    // 3. Create Project
    const newProject: Project = {
      id: projectId,
      name: input.name,
      type: input.type,
      address: input.address || '',
      clientId: client.id,
      clientName: client.name,
      createdBy: input.createdBy,
      status: 'DRAFT',
      members: [],
      phases,
      statusChangedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    return await projectRepository.create(newProject);
  }
}

export const projectService = new ProjectService();
