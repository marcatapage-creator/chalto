import { Project } from '../types';

let mockProjects: Project[] = [
  {
    id: 'prj-123',
    name: 'Rénovation Loft Bastille',
    type: 'RENOVATION',
    address: 'Paris 11ème',
    clientId: 'cli-1',
    clientName: 'Marc-Antoine Dupont',
    createdBy: 'arch-1',
    status: 'STUDY',
    members: [],
    phases: [
      { id: 'ph-1', projectId: 'prj-123', name: 'APS', order: 1, status: 'DONE' },
      { id: 'ph-2', projectId: 'prj-123', name: 'APD', order: 2, status: 'DOING' },
      { id: 'ph-3', projectId: 'prj-123', name: 'PRO', order: 3, status: 'TODO' },
    ],
    statusChangedAt: '2026-03-20T10:00:00Z',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-04-05T15:00:00Z',
  }
];

export class ProjectRepository {
  async getAll(): Promise<Project[]> {
    return mockProjects;
  }

  async getById(id: string): Promise<Project | null> {
    return mockProjects.find(p => p.id === id) || null;
  }

  async create(project: Project): Promise<Project> {
    mockProjects.push(project);
    return project;
  }

  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockProjects[index] = { ...mockProjects[index], ...updates, updatedAt: new Date().toISOString() };
    return mockProjects[index];
  }
}

export const projectRepository = new ProjectRepository();
