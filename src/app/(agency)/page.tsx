'use client';

import React from 'react';
import { PageHeader, SectionCard } from '@/components/ui/LayoutPrimitives';
import { Project, NextAction } from '@/core/types';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User,
  AlertCircle
} from 'lucide-react';

const MOCK_PROJECTS: (Project & { nextAction: NextAction })[] = [
  {
    id: 'prj-123',
    name: 'Rénovation Loft Bastille',
    type: 'RENOVATION',
    clientName: 'Marc-Antoine Dupont',
    clientId: 'cli-1',
    address: 'Paris 11ème',
    status: 'STUDY',
    createdBy: 'arch-1',
    members: [],
    phases: [],
    nextAction: { label: 'Attente validation client sur Esquisse V1', type: 'SYSTEM', priority: 'URGENT' },
    statusChangedAt: '2026-03-20T10:00:00Z',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-04-05T15:00:00Z',
  },
  {
    id: 'prj-456',
    name: 'Villa Cap Ferret',
    type: 'CONSTRUCTION',
    clientName: 'Julie Lefebvre',
    clientId: 'cli-2',
    address: 'Lège-Cap-Ferret',
    status: 'EXECUTION',
    createdBy: 'arch-1',
    members: [],
    phases: [],
    nextAction: { label: 'Appeler le client pour valider la cuisine', type: 'MANUAL', priority: 'IMPORTANT' },
    statusChangedAt: '2026-02-15T09:00:00Z',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-04-05T10:30:00Z',
  },
  {
    id: 'prj-789',
    name: 'Extension Meudon',
    type: 'EXTENSION',
    clientName: 'Famille Bertrand',
    clientId: 'cli-3',
    address: 'Meudon (92)',
    status: 'PROPOSAL',
    createdBy: 'arch-1',
    members: [],
    phases: [],
    nextAction: { label: 'Envoyer le devis final', type: 'SYSTEM', priority: 'IMPORTANT' },
    statusChangedAt: '2026-01-10T14:00:00Z',
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-04-04T12:00:00Z',
  },
];


export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader 
        title="Portefeuille" 
        subtitle="Pilotez vos chantiers et priorisez vos actions."
        actions={
          <Link 
            href="/projects/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-md transition-all"
          >
            <Plus size={18} /> CRÉER UN PROJET
          </Link>
        }
      />


      {/* Stats Summary */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Projets actifs" value="12" sub="8 en cours, 4 en attente" color="blue" />
        <StatCard label="Actions urgentes" value="5" sub="3 système, 2 manuelles" color="amber" />
        <StatCard label="Validations" value="8" sub="Attente réponse client" color="emerald" />
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un projet, un client..." 
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          <Filter size={18} /> Filtres
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {MOCK_PROJECTS.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: 'blue' | 'amber' | 'emerald' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className={`card-panel px-6 py-5 border-l-4 ${colors[color]}`}>
      <span className="text-xs font-black uppercase tracking-wider opacity-60">{label}</span>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-black">{value}</span>
        <span className="text-sm font-medium opacity-80">{sub}</span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project & { nextAction: NextAction } }) {
  const priority = project.nextAction.priority || 'INFO';
  
  const priorityStyles: Record<string, string> = {
    URGENT: 'border-red-100 bg-red-50 text-red-900',
    IMPORTANT: 'border-amber-100 bg-amber-50 text-amber-900',
    INFO: 'border-blue-100 bg-blue-50 text-blue-900',
  };

  const badgeStyles: Record<string, string> = {
    URGENT: 'bg-red-600 text-white',
    IMPORTANT: 'bg-amber-100 text-amber-600',
    INFO: 'bg-blue-100 text-blue-600',
  };

  return (
    <Link 
      href={`/projects/${project.id === 'prj-123' ? 'id' : project.id}`} 
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="flex h-full flex-col md:flex-row md:items-center">
        {/* Main Info */}
        <div className="flex flex-1 p-6">
          <div className="mr-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <span className="text-xl font-bold">{project.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white">
              {project.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 font-medium"><User size={16} /> {project.clientName}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {project.address}</span>
            </div>
          </div>
        </div>

        {/* Status & Next Action */}
        <div className="flex w-full flex-col border-t border-slate-100 bg-slate-50/50 p-6 md:w-96 md:border-l md:border-t-0 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="mb-3 flex items-center justify-between">
            <span className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${badgeStyles[priority]}`}>
              {project.status === 'STUDY' ? 'Étude en cours' : 
               project.status === 'EXECUTION' ? 'Suivi Chantier' : 'Dossier Validation'}
            </span>
            <ChevronRight size={18} className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>
          
          <div className={`flex flex-col gap-1 rounded-lg border p-3 ${priorityStyles[priority]}`}>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
              {priority === 'URGENT' ? <AlertCircle size={10} /> : <Clock size={10} />} {project.nextAction.type} • {priority}
            </span>
            <p className="text-sm font-bold leading-tight">
              {project.nextAction.label}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
