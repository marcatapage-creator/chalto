'use client';

import React, { useState } from 'react';
import { Project, Document, ProjectStatus } from '@/core/types';
import { PageHeader, SectionCard } from '@/components/ui/LayoutPrimitives';
import { StepTimeline } from '@/components/ui/StepTimeline';
import { StickyNextAction } from '@/components/ui/StickyNextAction';
import { useProjectV2 } from '@/core/hooks/v2/useProjectV2';
import { AuditTimeline } from '@/components/ui/v2/AuditTimeline';
import { AddDocumentModalV2 } from '@/components/ui/v2/AddDocumentModalV2';
import { RequestReviewModalV2 } from '@/components/ui/v2/RequestReviewModalV2';
import { RecordDecisionModalV2 } from '@/components/ui/v2/RecordDecisionModalV2';
import { useSearchParams } from 'next/navigation';
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
  Globe,
  Sparkles,
  ArrowRight,
  UserPlus,
  FilePlus2,
  Settings,
  CheckCircle2
} from 'lucide-react';


// Mock Data for the demonstration
const MOCK_PROJECT: Project = {
  id: 'prj-123',
  name: 'Rénovation Loft Bastille',
  type: 'RENOVATION',
  clientName: 'Marc-Antoine Dupont',
  clientId: 'cli-1',
  address: '12 Rue de la Roquette, 75011 Paris',
  status: 'STUDY',
  createdBy: 'arch-1',
  members: [
    { id: 'm1', userId: 'u1', role: 'ARCHITECT', name: 'Sophie Archi' },
    { id: 'm2', userId: 'u2', role: 'CLIENT', name: 'Marc-Antoine Dupont' },
  ],
  phases: [
    { id: 'ph-1', projectId: 'prj-123', name: 'APS', order: 1, status: 'DONE' },
    { id: 'ph-2', projectId: 'prj-123', name: 'APD', order: 2, status: 'DOING' },
    { id: 'ph-3', projectId: 'prj-123', name: 'PRO', order: 3, status: 'TODO' },
    { id: 'ph-4', projectId: 'prj-123', name: 'DCE', order: 4, status: 'TODO' },
    { id: 'ph-5', projectId: 'prj-123', name: 'Chantier', order: 5, status: 'TODO' },
  ],
  statusChangedAt: new Date().toISOString(),
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

// Mock Data for the demonstration (legacy V1)

export default function ProjectDetailPage() {
  const searchParams = useSearchParams();
  const isNew = searchParams.get('status') === 'new';
  const [activeTab, setActiveTab] = useState<'docs' | 'activity' | 'validations' | 'actors'>('docs');
  const [project, setProject] = useState<any>(MOCK_PROJECT);
  const [showTechnical, setShowTechnical] = useState(false);

  const { v2Context, nextActions, threadHistories, migrationReport } = useProjectV2(project, MOCK_DOCUMENTS, 'arch-1');

  // Modal States
  const [isAddDocOpen, setAddDocOpen] = useState(false);
  const [isReqReviewOpen, setReqReviewOpen] = useState(false);
  const [isRecordDecisionOpen, setRecordDecisionOpen] = useState(false);

  // Fallbacks for demo
  const selectedThreadId = v2Context.threads[0]?.id || ''; 
  const selectedVersion = v2Context.versions[0]; 
  const selectedRequest = v2Context.requests[0]; 


  // NextAction logic (V2)
  const topAction = nextActions[0] || { 
    type: 'PROJECT_FOLLOW_UP', 
    priority: 'INFO', 
    reason: 'Rien à signaler pour le moment.',
    target: { type: 'PROJECT', id: project.id }
  };

  const handleCompleteAction = () => {
    alert("Action marquée comme terminée ! (Lancement de la commande métier)");
  };

  const handleEditAction = () => {
    alert("L'édition manuelle sera réimplémentée via Override V2");
  };

  return (
    <div className="-m-8">
      {/* 1. Sticky Next Action (V2) */}
      {!isNew && (
        <StickyNextAction 
          action={topAction} 
          onComplete={handleCompleteAction}
          onEdit={handleEditAction}
        />
      )}

      <div className="mx-auto max-w-7xl p-8">
        {/* New Project Onboarding Banner */}
        {isNew && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-8 dark:border-blue-900/40 dark:bg-blue-900/10">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <CheckCircle2 size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Configuration initiale terminée</span>
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Projet créé avec succès</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                  Les phases ont été générées automatiquement selon le type choisi. 
                  Le projet est actuellement en <span className="font-bold text-slate-700 underline">Brouillon</span>.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-1">
                <OnboardingButton icon={<Settings size={14} />} label="Compléter les infos projet" color="bg-white border border-slate-200 text-slate-700" />
                <OnboardingButton icon={<UserPlus size={14} />} label="Inviter le client" color="bg-blue-600 text-white" />
                <OnboardingButton icon={<FilePlus2 size={14} />} label="Ajouter le premier document" color="bg-slate-900 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* 2. Header & Status */}
        <PageHeader 
          title={project.name}
          subtitle={`${project.clientName} • ${project.address}`}
          backUrl="/projects"

          actions={
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setReqReviewOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
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
                label="Activité (Audit-First)" 
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
                  <button 
                    onClick={() => setAddDocOpen(true)}
                    className="text-sm font-bold text-blue-600 hover:underline">
                    + Ajouter un document
                  </button>
                </div>
                
                {MOCK_DOCUMENTS.map(doc => (
                  <DocumentRow key={doc.id} doc={doc} />
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <AuditTimeline 
                events={threadHistories.flatMap(th => th.history)} 
                migrationReport={migrationReport} 
              />
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

          {/* V2 Modals */}
          <AddDocumentModalV2 
            isOpen={isAddDocOpen}
            onClose={() => setAddDocOpen(false)}
            threadId={selectedThreadId}
            projectId={project.id}
            actorId="arch-1"
            onSuccess={() => console.log('Doc Added')}
          />

          {selectedVersion && (
            <RequestReviewModalV2 
              isOpen={isReqReviewOpen}
              onClose={() => setReqReviewOpen(false)}
              version={selectedVersion}
              projectId={project.id}
              actorId="arch-1"
              recipients={project.members.filter((m: any) => m.role === 'CLIENT')}
              onSuccess={() => console.log('Review Requested')}
            />
          )}

          {selectedRequest && (
            <RecordDecisionModalV2 
              isOpen={isRecordDecisionOpen}
              onClose={() => setRecordDecisionOpen(false)}
              request={selectedRequest}
              actorId="cli-1"
              onSuccess={() => console.log('Decision Recorded')}
            />
          )}


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

function OnboardingButton({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <button className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 ${color}`}>
      {icon}
      {label}
    </button>
  );
}

