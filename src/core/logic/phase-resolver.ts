import { ProjectType, Phase } from '../types';

export function getPhasesForType(projectId: string, type: ProjectType): Omit<Phase, 'id'>[] {
  const commonPhases = [
    { projectId, name: 'APS', order: 1, status: 'TODO' as const },
    { projectId, name: 'APD', order: 2, status: 'TODO' as const },
    { projectId, name: 'PRO', order: 3, status: 'TODO' as const },
    { projectId, name: 'DCE', order: 4, status: 'TODO' as const },
    { projectId, name: 'Chantier', order: 5, status: 'TODO' as const },
  ];

  if (type === 'CONSTRUCTION') {
    return [
      { projectId, name: 'ESQ', order: 0, status: 'TODO' as const },
      { projectId, name: 'APS', order: 1, status: 'TODO' as const },
      { projectId, name: 'APD', order: 2, status: 'TODO' as const },
      { projectId, name: 'PC', order: 3, status: 'TODO' as const },
      { projectId, name: 'PRO', order: 4, status: 'TODO' as const },
      { projectId, name: 'DCE', order: 5, status: 'TODO' as const },
      { projectId, name: 'Chantier', order: 6, status: 'TODO' as const },
    ];
  }

  return commonPhases;
}

