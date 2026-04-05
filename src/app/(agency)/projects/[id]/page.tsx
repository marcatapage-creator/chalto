'use client';

import React, { useState } from 'react';
import { Project, Document, ProjectStatus } from '@/core/types';
import { PageHeader, SectionCard } from '@/components/ui/LayoutPrimitives';
import { StepTimeline } from '@/components/ui/StepTimeline';
import { StickyNextAction } from '@/components/ui/StickyNextAction';
import { getDisplayedNextAction } from '@/core/logic/next-action';
import { 
  FileText, 
  Clock, 
  CheckSquare, 
  Users, 
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Share2,
  Lock,
  Globe
} from 'lucide-react';

// Mock Data for the demonstration
const MOCK_PROJECT: Project = {
  id: 'prj-123',
  name: 'Rénovation Loft Bastille',
  clientName: 'Marc-Antoine Dupont',
  address: '12 Rue de la Roquette, 75011 Paris',
  status: 'STUDY',
  members: [
    { id: 'm1', userId: 'u1', role: 'ARCHITECT', name: 'Sophie Archi' },
    { id: 'm2', userId: 'u2', role: 'CLIENT', name: 'Marc-Antoine Dupont' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    name: 'Plan de Masse - État des lieux',
    url: '/uploads/plan-masse.pdf',
    versionNumber: 1,
    isLatest: true,
    status: 'APPROVED',
    visibility: ['ARCHITECT', 'CLIENT', 'CONTRACTOR'],
    uploadedBy: 'Sophie Archi',
    uploadedAt: '2026-04-01T10:00:00Z',
    stage: 'STUDY',
  },
  {
    id: 'doc-2',
    name: 'Esquisse V1 - Distribution RDC',
    url: '/uploads/esquisse-v1.pdf',
    versionNumber: 2,
    isLatest: true,
    status: 'PENDING',
    visibility: ['ARCHITECT', 'CLIENT'],
    uploadedBy: 'Sophie Archi',
    uploadedAt: '2026-04-04T15:30:00Z',
    stage: 'STUDY',
  },
  {
    id: 'doc-3',
    name: 'Détail Technique - Cuisine',
    url: '/uploads/cuisine-tech.pdf',
    versionNumber: 1,
    isLatest: true,
    status: 'DRAFT',
    visibility: ['ARCHITECT'],
    uploadedBy: 'Sophie Archi',
    uploadedAt: '2026-04-05T09:00:00Z',
    stage: 'STUDY',
  },
];

const MOCK_ACTIVITY: any[] = [
  {
    id: 'act-1',
    type: 'DOC_UPLOAD',
    actorName: 'Sophie Archi',
    action: 'Document doc-2 uploaded (version 2)',
    humanLabel: 'Sophie Archi vous a envoyé une nouvelle version du plan.',
    timestamp: '2026-04-04T15:30:00Z',
  },
  {
    id: 'act-2',
    type: 'VALIDATION_RES',
    actorName: 'Marc-Antoine Dupont',
    action: 'Validation #123 approved',
    humanLabel: 'Le client a validé le Plan de Masse.',
    timestamp: '2026-04-01T10:00:00Z',
  }
];

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState<'docs' | 'activity' | 'validations' | 'actors'>('docs');
  const [project, setProject] = useState<any>(MOCK_PROJECT);
  const [showTechnical, setShowTechnical] = useState(false);

  const nextAction = getDisplayedNextAction(project, MOCK_DOCUMENTS, []);

  const handleCompleteAction = () => {
    alert("Action marquée comme terminée !");
  };

  const handleEditAction = () => {
    const newLabel = prompt("Modifier la prochaine action :", nextAction.label);
    if (newLabel) {
      setProject({
        ...project,
        nextActionOverride: {
          label: newLabel,
          type: 'MANUAL',
          description: "Action personnalisée par l'architecte."
        }
      });
    }
  };

  const handleResetAction = () => {
    setProject({ ...project, nextActionOverride: undefined });
  };

  return (
    <div className="-m-8">
      {/* 1. Sticky Next Action */}
      <StickyNextAction 
        action={nextAction} 
        onComplete={handleCompleteAction}
        onEdit={handleEditAction}
        onReset={handleResetAction}
      />

      <div className="mx-auto max-w-7xl p-8">
        {/* 2. Header & Status */}
        <PageHeader 
          title={project.name}
          subtitle={`${project.clientName} • ${project.address}`}
          backUrl="/projects"
          actions={
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Lancer une validation
              </button>
            </div>
          }
        />

        {/* 3. Timeline */}
        <SectionCard className="mb-8">
          <StepTimeline currentStatus={project.status} />
        </SectionCard>

        {/* 4. Main Activity Area with Tabs */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800">
              <TabButton 
                label="Documents" 
                icon={<FileText size={18} />} 
                active={activeTab === 'docs'} 
                onClick={() => setActiveTab('docs')} 
              />
              <TabButton 
                label="Activité" 
                icon={<Clock size={18} />} 
                active={activeTab === 'activity'} 
                onClick={() => setActiveTab('activity')} 
              />
              <TabButton 
                label="Validations" 
                icon={<CheckSquare size={18} />} 
                active={activeTab === 'validations'} 
                onClick={() => setActiveTab('validations')} 
              />
              <TabButton 
                label="Acteurs" 
                icon={<Users size={18} />} 
                active={activeTab === 'actors'} 
                onClick={() => setActiveTab('actors')} 
              />
            </div>

            {activeTab === 'docs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Documents du projet ({MOCK_DOCUMENTS.length})
                  </h4>
                  <button className="text-sm font-bold text-blue-600 hover:underline">
                    + Ajouter un document
                  </button>
                </div>
                
                {MOCK_DOCUMENTS.map(doc => (
                  <DocumentRow key={doc.id} doc={doc} />
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    Histoire du projet
                  </h4>
                  <button 
                    onClick={() => setShowTechnical(!showTechnical)}
                    className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest"
                  >
                    {showTechnical ? 'Masquer logs techniques' : 'Voir logs techniques'}
                  </button>
                </div>
                
                <div className="space-y-4 border-l-2 border-slate-100 pl-6 ml-2">
                  {MOCK_ACTIVITY.map(act => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-200" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(act.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </span>
                        <p className="mt-1 text-sm font-bold text-slate-700">{act.humanLabel}</p>
                        {showTechnical && (
                          <div className="mt-2 rounded-lg bg-slate-50 p-2 font-mono text-[10px] text-slate-500 border border-slate-100">
                            CMD: {act.action}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'validations' && (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-800">
                <p className="font-bold">Module de validation actif</p>
                <p className="text-xs mt-2">Accès direct aux demandes envoyées au client</p>
              </div>
            )}

            {activeTab === 'actors' && (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-800">
                <p>Gestion des membres du projet</p>
              </div>
            )}
          </div>

          {/* Sidebar / Quick Info */}
          <aside className="w-full lg:w-80">
            <SectionCard title="Résumé du projet">
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Type de projet</span>
                  <span className="font-medium">Rénovation complète</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Surface estimée</span>
                  <span className="font-medium">120 m²</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Contact Client</span>
                  <span className="font-medium text-blue-600 underline">marc@exemple.com</span>
                </div>
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${
        active 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DocumentRow({ doc }: { doc: Document }) {
  const isPrivate = doc.visibility.length === 1 && doc.visibility[0] === 'ARCHITECT';
  
  return (
    <div className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
          doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
          doc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
        }`}>
          <FileText size={24} />
        </div>
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {doc.name}
          </h5>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>v{doc.versionNumber}</span>
            <span>•</span>
            <span>Modifié le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              {isPrivate ? (
                <>
                  <Lock size={12} className="text-amber-500" />
                  <span className="text-amber-600 font-medium">Interne uniquement</span>
                </>
              ) : (
                <>
                  <Globe size={12} className="text-emerald-500" />
                  <span className="text-emerald-600 font-medium">Partagé {doc.visibility.includes('CLIENT') ? 'Client' : ''} {doc.visibility.includes('CONTRACTOR') ? '& Presta' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-slate-400 hover:text-blue-600">
          <Eye size={18} />
        </button>
        <button className="p-2 text-slate-400 hover:text-blue-600">
          <Download size={18} />
        </button>
        <button className="p-2 text-slate-400 hover:text-blue-600">
          <Share2 size={18} />
        </button>
        <button className="p-2 text-slate-400 hover:text-red-600">
          <Trash2 size={18} />
        </button>
        <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
        <button className="p-2 text-slate-400 hover:text-slate-900">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
