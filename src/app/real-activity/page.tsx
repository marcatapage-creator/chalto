'use client';

import React, { useState, useMemo } from 'react';
import { useLedger } from '@/core/ledger/ledger-hook';
import { LedgerEntry, LedgerEntryType } from '@/models/context';
import { 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Filter, 
  LayoutDashboard, 
  Split, 
  XCircle,
  Edit2
} from 'lucide-react';
import Link from 'next/link';
import { LedgerEntryModal } from '@/components/LedgerEntryModal';

export default function MaRealitePage() {
  const { 
    entries, 
    confirmAsReal, 
    cancelForecast, 
    editAndConfirm,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoaded 
  } = useLedger();

  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterType, setFilterType] = useState<LedgerEntryType | 'all'>('all');

  // Grouping by Month
  const months = useMemo(() => {
    const grouped: Record<string, LedgerEntry[]> = {};
    const filtered = filterType === 'all' 
      ? entries 
      : entries.filter(e => e.type === filterType);

    filtered.forEach(e => {
      if (!grouped[e.monthKey]) grouped[e.monthKey] = [];
      grouped[e.monthKey].push(e);
    });

    return Object.keys(grouped).sort().map(key => ({
      key,
      label: new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(key + '-01')),
      entries: grouped[key].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())
    }));
  }, [entries, filterType]);

  const summary = useMemo(() => {
    const realized = entries.filter(e => e.status === 'realized' && e.type === 'revenue').reduce((s, e) => s + e.amountCents, 0);
    const planned = entries.filter(e => e.status === 'planned' && e.type === 'revenue').reduce((s, e) => s + e.amountCents, 0);
    const total = realized + planned;
    const progress = total > 0 ? (realized / total) * 100 : 0;

    return { realized, planned, total, progress };
  }, [entries]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="mb-12 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Ma Réalité</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Flux Annuel</h1>
            <p className="text-zinc-500 text-sm">Transformez vos prévisions en réalité au fil de l'année.</p>
          </div>
          <Link href="/dashboard" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-zinc-400" />
          </Link>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Revenu Confirmé</div>
            <div className="text-2xl font-bold text-emerald-400">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(summary.realized / 100)}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Reste à encaisser</div>
            <div className="text-2xl font-bold text-zinc-300">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(summary.planned / 100)}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">Avancement</div>
              <div className="text-xs font-bold text-indigo-400">{Math.round(summary.progress)}%</div>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${summary.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
          >
            Tout
          </button>
          {(['revenue', 'business_expense', 'personal_drawing', 'tax_payment'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === type ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
            >
              {type === 'revenue' ? 'Revenus' : type === 'business_expense' ? 'Charges Pro' : type === 'personal_drawing' ? 'Perso' : 'Fiscal'}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-12">
          {months.map(month => (
            <div key={month.key}>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-700 mb-6 flex items-center gap-4">
                {month.label}
                <div className="h-px flex-1 bg-white/5" />
              </h2>
              <div className="space-y-3">
                {month.entries.map(entry => (
                  <EntryRow 
                    key={entry.id} 
                    entry={entry} 
                    onConfirm={confirmAsReal}
                    onCancel={cancelForecast}
                    onEdit={(e) => {
                      setSelectedEntry(e);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <LedgerEntryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addEntry}
          onUpdate={(id, updates) => {
             if (selectedEntry?.status === 'planned') {
               // Transform to realized on update
               const amount = (updates.amountCents || selectedEntry.amountCents);
               const date = (updates.effectiveDate || selectedEntry.effectiveDate);
               editAndConfirm(id, amount, date);
             } else {
               updateEntry(id, updates);
             }
             setIsModalOpen(false);
          }}
          onDelete={deleteEntry}
          entry={selectedEntry}
        />
      </div>
    </div>
  );
}

function EntryRow({ entry, onConfirm, onCancel, onEdit }: { 
  entry: LedgerEntry, 
  onConfirm: (id: string) => void,
  onCancel: (id: string) => void,
  onEdit: (entry: LedgerEntry) => void
}) {
  const isIncome = entry.type === 'revenue';
  const isCancelled = entry.status === 'cancelled';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isCancelled ? 'opacity-30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-0.5 flex items-center gap-2">
              {entry.category}
              {entry.status === 'planned' && (
                <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-black bg-indigo-500/20 text-indigo-400 tracking-tighter">
                  Prévision
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-600 flex items-center gap-2 uppercase tracking-widest font-bold">
              {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(entry.effectiveDate)}
              <span>•</span>
              {entry.source}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`text-sm font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-white'}`}>
            {isIncome ? '+' : '-'}{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.amountCents / 100)}
          </div>
          
          <div className="flex items-center gap-2">
            {entry.status === 'planned' && !isCancelled && (
              <>
                <button 
                  onClick={() => onConfirm(entry.id)}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                  title="Confirmer comme réel"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onEdit(entry)}
                  className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 transition-all border border-white/10"
                  title="Modifier et confirmer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onCancel(entry.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                  title="Annuler"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {entry.status === 'realized' && (
              <div className="text-emerald-500/40" title="Réel">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
