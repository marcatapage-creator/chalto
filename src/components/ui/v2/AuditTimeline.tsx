'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XSquare, 
  History, 
  ShieldAlert, 
  Database,
  ArrowRight,
  User,
  Info
} from 'lucide-react';
import { MigrationReport } from '@/core/logic/v2/migration';

type ViewMode = 'STORY' | 'BUSINESS' | 'AUDIT';

interface AuditTimelineProps {
  events: any[];
  migrationReport?: MigrationReport;
}

/**
 * AuditTimeline Component (3 Levels of Reading)
 * The visual projection of the Audit-First system.
 */
export function AuditTimeline({ events, migrationReport }: AuditTimelineProps) {
  const [mode, setMode] = useState<ViewMode>('STORY');

  return (
    <div className="space-y-6">
      {/* 1. Mode Selector */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">
          Histoire du projet
        </h4>
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <ModeButton label="Client" active={mode === 'STORY'} onClick={() => setMode('STORY')} />
          <ModeButton label="Pro" active={mode === 'BUSINESS'} onClick={() => setMode('BUSINESS')} />
          <ModeButton label="Audit" active={mode === 'AUDIT'} onClick={() => setMode('AUDIT')} />
        </div>
      </div>

      {/* 2. Migration Warning (if Audit mode) */}
      {mode === 'AUDIT' && migrationReport && migrationReport.anomalies.length > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div className="flex items-start gap-4">
            <ShieldAlert className="mt-0.5 text-amber-500" size={18} />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest">
                Anomalies de Migration détectées ({migrationReport.anomalies.length})
              </p>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                La vérité héritée du système V1 présente des ambiguïtés temporelles ou d'acteurs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Event List */}
      <div className="relative space-y-8 border-l-2 border-slate-100 pl-6 ml-2 dark:border-slate-800">
        {events.map((evt, idx) => {
          // Filtering logic based on mode
          if (mode === 'STORY' && evt.type === 'VERSION' && idx > 0) return null; // Only show first upload or milestones in Story
          
          return (
            <TimelineEntry key={idx} event={evt} mode={mode} />
          );
        })}
      </div>
    </div>
  );
}

function ModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900' 
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function TimelineEntry({ event, mode }: { event: any; mode: ViewMode }) {
  const { type, timestamp, data } = event;

  // Wording / Logic mapping
  const labels: Record<string, any> = {
    'VERSION': {
      icon: <FileText size={16} className="text-blue-500" />,
      story: `Nouveau document envoyé : ${data.versionNumber > 1 ? 'Nouvelle version' : 'Initial'}`,
      business: `Document v${data.versionNumber} uploadeé`,
    },
    'REVIEW_REQUEST': {
      icon: <History size={16} className="text-amber-500" />,
      story: `Demande de validation transmise au client`,
      business: `ReviewRequest créée (ID: ${data.id})`,
    },
    'DECISION': {
      icon: data.outcome === 'APPROVED' 
        ? <CheckCircle2 size={16} className="text-emerald-500" />
        : <XSquare size={16} className="text-rose-500" />,
      story: data.outcome === 'APPROVED' ? `Document validé par le client` : `Document à revoir`,
      business: `Décision : ${data.outcome} (${data.authority})`,
    }
  };

  const config = labels[type] || { icon: <Info size={16} />, story: 'Événement inconnu', business: 'Unknow Event' };

  return (
    <div className="relative group">
      {/* Node */}
      <div className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-200 dark:border-slate-950 group-hover:bg-blue-400 transition-colors" />
      
      <div className="flex flex-col">
        {/* Timestamp */}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Human / Business Label */}
        <div className="mt-1 flex items-center gap-2">
          {config.icon}
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {mode === 'STORY' ? config.story : config.business}
          </p>
        </div>

        {/* Audit Details (Layer 3) */}
        {mode === 'AUDIT' && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-3 font-mono text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <Database size={10} />
                <span>UUID: {data.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={10} />
                <span>ACTOR: {data.createdBy || data.decidedBy || 'SYSTEM'}</span>
              </div>
              {data.fileHash && (
                <div className="col-span-2 flex items-center gap-1 border-t border-slate-100 pt-1 mt-1 dark:border-slate-800">
                  <ShieldAlert size={10} />
                  <span className="truncate">HASH: {data.fileHash}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pro / Business Meta (Layer 2) */}
        {mode === 'BUSINESS' && data.rationale && (
          <p className="mt-2 text-xs italic text-slate-500 bg-blue-50/30 p-2 rounded border-l-2 border-blue-200">
            {data.rationale}
          </p>
        )}
      </div>
    </div>
  );
}
