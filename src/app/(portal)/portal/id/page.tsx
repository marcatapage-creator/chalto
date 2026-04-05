'use client';

import React, { useState } from 'react';
import { Project, Document, ValidationRequest, ProjectStatus } from '@/core/types';
import { SectionCard } from '@/components/ui/LayoutPrimitives';
import { CheckCircle2, XCircle, FileText, Clock, ChevronRight, ShieldCheck, MessageCircle, MoreHorizontal, Download, Eye, Trash2, Share2, Lock, Globe, PartyPopper } from 'lucide-react';

// Mock Data for the Client Portal Experience
const MOCK_PROJECT: Project = {
  id: 'prj-123',
  name: 'Rénovation Loft Bastille',
  clientName: 'Marc-Antoine Dupont',
  address: '12 Rue de la Roquette, 75011 Paris',
  status: 'STUDY',
  members: [],
  statusChangedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_PENDING_DOC: Document = {
  id: 'doc-2',
  name: 'Esquisse V1 - Distribution RDC.pdf',
  url: '#',
  versionNumber: 2,
  isLatest: true,
  status: 'PENDING',
  visibility: ['ARCHITECT', 'CLIENT'],
  uploadedBy: 'Sophie Archi',
  uploadedAt: '2026-04-05T10:00:00Z',
  stage: 'STUDY',
};

const MOCK_SHARED_DOCS: Document[] = [
  {
    id: 'doc-1',
    name: 'Plan de Masse - État des lieux.pdf',
    url: '#',
    versionNumber: 1,
    isLatest: true,
    status: 'APPROVED',
    visibility: ['ARCHITECT', 'CLIENT', 'CONTRACTOR'],
    uploadedBy: 'Sophie Archi',
    uploadedAt: '2026-04-01T10:00:00Z',
    stage: 'STUDY',
  },
];

export default function ClientPortalPage() {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // 1. Smart Summary & Progression
  const projectHealth = {
    status: 'NORMAL',
    label: 'Votre projet avance normalement.',
    details: 'Nous sommes à l’étape "Étude de décision". Votre action est attendue sur l’esquisse.',
    currentStep: 4,
    totalSteps: 6
  };

  if (isDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <PartyPopper size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Validation reçue !</h1>
        <p className="mt-4 max-w-sm text-slate-600">Merci Marc-Antoine. Votre validation a bien été transmise à Sophie Archi. Le projet passe à l'étape suivante.</p>
        <button 
          onClick={() => setIsDone(false)}
          className="mt-8 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          Retourner au projet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. Premium Hero Header & Smart Summary */}
      <header className="bg-white px-6 pb-12 pt-16 shadow-sm sm:px-8 lg:px-12 border-b border-slate-100">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
            <ShieldCheck size={14} /> ESPACE SÉCURISÉ • CHALTO PRO
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl text-slate-900">
            {MOCK_PROJECT.name}
          </h1>
          
          {/* Smart Summary Block with Progression Info */}
          <div className="mt-8 flex items-start gap-4 rounded-3xl bg-blue-50/50 p-6 border border-blue-100 relative overflow-hidden group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-slate-900">{projectHealth.label}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/50 px-2 py-1 rounded-md">
                  Étape {projectHealth.currentStep} / {projectHealth.totalSteps}
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-blue-600/80">{projectHealth.details}</p>
              
              {/* Progress Bar (Visual reassurance) */}
              <div className="mt-4 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${(projectHealth.currentStep / projectHealth.totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-12">
        {/* 2. Critical Action Block (THE FOCUS) */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Action Requise
          </h2>
          <div className="overflow-hidden rounded-3xl border-2 border-blue-600 bg-white shadow-2xl shadow-blue-100">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 lg:p-10">
                <div className="flex items-start gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-tight text-slate-900">
                      {MOCK_PENDING_DOC.name}
                    </h3>
                    <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                      Ce que vous validez : <span className="text-blue-600">L'implantation générale de la cuisine et du séjour</span>
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 mb-2">
                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                      "En validant ce document, vous donnez votre accord sur l'implantation générale. 
                      Cette étape est nécessaire pour lancer la phase de devis entreprises."
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsDone(true)}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-lg font-black text-white shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CheckCircle2 size={22} /> VALIDER LE PLAN
                  </button>
                  <button 
                    onClick={() => setShowFeedback(!showFeedback)}
                    className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-700 transition-all hover:bg-slate-50"
                  >
                    <MessageCircle size={20} className="text-blue-500" /> DEMANDER UNE MODIFICATION
                  </button>
                </div>

                {showFeedback && (
                  <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <textarea
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Indiquez ici les modifications souhaitées (obligatoire pour un refus)..."
                      className="w-full min-h-[120px] rounded-2xl border-2 border-slate-100 bg-slate-50 p-6 text-base font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-8 focus:ring-blue-500/5"
                    />
                    <div className="mt-4 flex justify-end">
                      <button 
                        disabled={!feedback.trim()}
                        onClick={() => setIsDone(true)}
                        className="rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition-all hover:bg-red-700 disabled:opacity-50"
                      >
                        ENVOYER LES MODIFICATIONS
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex w-full flex-col justify-center border-t border-slate-100 bg-slate-50/50 p-8 md:w-72 md:border-l md:border-t-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AIDE</span>
                <p className="mt-2 text-sm font-bold text-slate-600 leading-relaxed">
                  En validant ce document, vous donnez votre accord pour passer à l'étape suivante.
                </p>
                <button className="mt-6 flex items-center gap-2 text-sm font-black text-blue-600 hover:underline">
                  Consulter le fichier <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Document Hub (Simplified) */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Documents Partagés
          </h2>
          <div className="space-y-4">
            {MOCK_SHARED_DOCS.map(doc => (
              <SimpleDocRow key={doc.id} doc={doc} />
            ))}
          </div>
        </section>

        {/* 4. Project History (STORYTELLING) */}
        <section>
          <h2 className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            L'histoire de votre projet
          </h2>
          <div className="space-y-8 pl-4 border-l-2 border-slate-100">
            <HistoryItem date="Aujourd'hui" text="Sophie Archi vous a envoyé une nouvelle version du plan." />
            <HistoryItem date="Il y a 3 jours" text="Vous avez validé le Plan de Masse." />
            <HistoryItem date="20 mars 2026" text="Sophie Archi a créé l'espace de votre projet Loft Bastille." />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-4xl px-6 py-12 text-center sm:px-8 lg:px-12 border-t border-slate-200">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Propulsé par Chalto Pro • Designé pour la clarté
        </p>
      </footer>
    </div>
  );
}

function StatusIndicator({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-lg font-black ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

function SimpleDocRow({ doc }: { doc: Document }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{doc.name}</h4>
          <p className="text-xs font-bold text-emerald-600 uppercase">Validé</p>
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function HistoryItem({ date, text }: { date: string; text: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[1.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{date}</span>
      <p className="mt-1 text-base font-bold text-slate-700">{text}</p>
    </div>
  );
}
