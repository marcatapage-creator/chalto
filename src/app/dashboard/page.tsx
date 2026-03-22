'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/models/user';
import { Ruleset } from '@/models/ruleset';
import ruleset2026 from '@/rulesets/ruleset_2026.json';
import { FiscalContextBuilder } from '@/core/context/fiscal-context-builder';
import { RevenueProjectionEngine } from '@/core/projection/projection-engine';
import { FiscalCalculationEngine } from '@/core/fiscal/fiscal-engine';
import { LiabilityScheduler } from '@/core/fiscal/liability-scheduler';
import { InflowPredictor } from '@/core/engine/inflow-predictor';
import { SimulationEngine } from '@/core/engine/simulation-engine';
import { DashboardPresenter } from '@/core/presentation/dashboard-presenter';
import { useLedger } from '@/core/ledger/ledger-hook';
import { RevenueBlender } from '@/core/projection/revenue-blender';
import { LedgerToSimulationAdapter } from '@/core/ledger/ledger-to-simulation-adapter';
import { TrustEngine } from '@/core/engine/trust-engine';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

import Link from 'next/link';
import { Info, TrendingUp, Landmark, Loader2, ChevronRight, Lock, Crown, Zap, ArrowRight, Check, Edit2 } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { Timeline } from '@/components/Timeline';
import { LedgerEntryModal } from '@/components/LedgerEntryModal';
import { LedgerEntry } from '@/models/context';
import { TimelineEntry } from '@/models/simulation';
import { Anomaly } from '@/core/engine/trust-engine';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

const AnomalyGuard: React.FC<{ anomalies: Anomaly[] }> = ({ anomalies }) => {
  if (anomalies.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {anomalies.map((anomaly, idx) => (
        <div 
          key={idx}
          className={cn(
            "p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all animate-in fade-in slide-in-from-top-4",
            anomaly.severity === 'critical' 
              ? "bg-rose-500/10 border-rose-500/20 text-rose-200" 
              : "bg-amber-500/5 border-amber-500/10 text-amber-200"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
              anomaly.severity === 'critical' ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
            )}>
              {anomaly.severity === 'critical' ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">{anomaly.message}</p>
              <p className={cn(
                "text-xs mt-0.5 font-medium opacity-60",
                anomaly.severity === 'critical' ? "text-rose-300" : "text-amber-300"
              )}>Action requise pour stabiliser tes calculs.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = anomaly.action === 'Aller dans Ma Réalité' ? '/real-activity' : '/settings'}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shrink-0",
              anomaly.severity === 'critical' 
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20" 
                : "bg-amber-500 text-black hover:bg-amber-600 shadow-amber-500/20"
            )}
          >
            {anomaly.action}
          </button>
        </div>
      ))}
    </div>
  );
};

export default function ChaltoDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustingEntry, setAdjustingEntry] = useState<LedgerEntry | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTreasury, setIsEditingTreasury] = useState(false);
  const [editedTreasury, setEditedTreasury] = useState('');

  useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const savedUser = localStorage.getItem(key);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/onboarding');
    }
    setLoading(false);
  }, [router]);

  const { entries, addEntry, updateEntry, deleteEntry, isLoaded: ledgerLoaded } = useLedger();

  const handleTreasurySave = () => {
    if (!user) return;
    const amount = parseFloat(editedTreasury.replace(',', '.'));
    if (isNaN(amount)) return;
    
    const updatedUser = { ...user, treasuryCurrentCents: Math.round(amount * 100) };
    localStorage.setItem(auth.getStorageKey('chalto_user_profile'), JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditingTreasury(false);
  };

  // 1. Reality Sync via RevenueBlender (Memoized for stability)
  const reality = React.useMemo(() => {
    if (!user) return null;
    return RevenueBlender.blend(entries, user);
  }, [entries, user]);

  const monthsWithActuals = React.useMemo(() => 
    new Set(entries.filter(e => e.status === 'realized').map(e => e.monthKey)).size
  , [entries]);

  // 2. Pipeline Execution with Blended Data (Memoized)
  const memoizedLogic = React.useMemo(() => {
    if (!user || !reality) return null;

    const context = FiscalContextBuilder.build(user, ruleset2026 as unknown as Ruleset);
    
    const monthlyRevenue = user.monthsElapsed > 0 ? Array(user.monthsElapsed).fill(reality.blendedAnnualRevenueCents / 12) : [];
    const projection = RevenueProjectionEngine.execute(context, monthlyRevenue);
    
    projection.annualProjectionCents = reality.blendedAnnualRevenueCents;
    projection.confidence = reality.confidenceLevel;
    
    const burden = FiscalCalculationEngine.execute(projection.annualProjectionCents || 0, context);
    const vatBurden = FiscalCalculationEngine.calculateVat(projection.annualProjectionCents || 0, context.ruleset);
    const scheduledLiabilities = LiabilityScheduler.scheduleFiscalBurden(burden, context.ruleset, vatBurden);
    
    const { inflows: ledgerInflows, liabilities: ledgerLiabilities } = LedgerToSimulationAdapter.adapt(entries);
    
    const trustReport = TrustEngine.calculateReliability(
      reality.actualsYTDCents, 
      user.estimatedAnnualRevenueCents || 0,
      user.monthsElapsed
    );

    const simulation = SimulationEngine.execute(
      user.treasuryCurrentCents || reality.actualsYTDCents,
      ledgerInflows, 
      [...ledgerLiabilities, ...scheduledLiabilities.filter(l => !ledgerLiabilities.some(ll => ll.id === l.id))], 
      50000,
      reality.confidenceScore,
      trustReport.pessimistBufferBps
    );

    return { context, projection, burden, vatBurden, scheduledLiabilities, trustReport, simulation };
  }, [user, entries, reality]);

  const state = React.useMemo(() => {
    if (!memoizedLogic) return null;
    return DashboardPresenter.present(
      memoizedLogic.context, 
      memoizedLogic.projection, 
      memoizedLogic.burden, 
      memoizedLogic.simulation, 
      memoizedLogic.trustReport
    );
  }, [memoizedLogic]);

  if (loading || !user || !ledgerLoaded || !state || !memoizedLogic) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const { burden, vatBurden, simulation } = memoizedLogic;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-secondary)] pb-32 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        
        {/* Zone 1 — Hero (Full Width) */}
        <Hero 
          amountCents={state.safeToSpendCents} 
          headline={state.headline}
          riskLevel={state.riskLevel}
          trustReport={state.trustReport}
          anomaly={state.anomalies.find(a => a.severity === 'critical') || state.anomalies[0]}
        />

        {/* Anomaly Guard / Reliability Alerts */}
        <AnomalyGuard anomalies={state.anomalies} />

        {/* Zone 2 — 3 Blocs Secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trésorerie */}
          <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4 shadow-lg group hover:border-indigo-500/20 transition-all cursor-pointer"
               onClick={() => {
                 if (!isEditingTreasury) {
                   setIsEditingTreasury(true);
                   setEditedTreasury((user.treasuryCurrentCents / 100).toString());
                 }
               }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Landmark className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Trésorerie</span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditingTreasury && <Edit2 className="w-3 h-3 text-indigo-500/0 group-hover:text-indigo-500/50 transition-all" />}
                {isEditingTreasury && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditingTreasury(false); }}
                      className="p-1 rounded-md hover:bg-white/10 text-zinc-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleTreasurySave(); }}
                      className="p-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-400"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {isEditingTreasury ? (
              <div onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  type="text"
                  value={editedTreasury}
                  onChange={(e) => setEditedTreasury(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTreasurySave();
                    if (e.key === 'Escape') setIsEditingTreasury(false);
                  }}
                  className="w-full bg-white/5 border border-indigo-500/30 rounded-xl py-2 px-3 text-2xl font-black text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            ) : (
              <div className="text-3xl font-black text-white">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(user.treasuryCurrentCents / 100)}
              </div>
            )}
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              {isEditingTreasury ? "Entrez votre solde réel" : "Sur ton compte réel"}
            </p>
          </div>

          {/* Provisionné */}
          <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-4 shadow-lg group hover:border-amber-500/20 transition-all">
            <div className="flex items-center gap-2 text-amber-500/60">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Provisionné</span>
            </div>
            <div className="text-3xl font-black text-amber-100">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(state.remainingFiscalLiabilityCents / 100)}
            </div>
            <p className="text-[10px] text-amber-500/40 font-bold uppercase tracking-wider">Réservé aux charges</p>
          </div>

          {/* Prochaine échéance */}
          <div className="p-8 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 space-y-4 shadow-lg group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-2 text-indigo-400">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Prochaine échéance</span>
            </div>
            {(() => {
              const nextDeadlines = simulation.timeline.filter(e => e.type === 'liability' || e.type === 'social_contribution' || e.type === 'vat' || e.type === 'tax_payment');
              const next = nextDeadlines[0];
              return (
                <>
                  <div className="text-3xl font-black text-white truncate">
                    {next?.label || 'Aucune échéance'}
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xl font-bold text-indigo-200">
                       {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.abs(next?.amountCents || 0) / 100)}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                       {next ? 'Bientôt' : '--'}
                     </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Zone 3 — Charges estimées annuelles (Collapsible) */}
        <details className="group rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden transition-all">
          <summary className="flex items-center justify-between p-8 cursor-pointer hover:bg-white/[0.04] transition-colors list-none">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Info className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Détail des charges estimées 2026</h3>
                <p className="text-xs text-zinc-500 font-medium">Bascule de régime incluse le cas échéant.</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-zinc-600 transition-transform group-open:rotate-90" />
          </summary>
          
          <div className="p-8 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                <span className="text-sm font-medium text-zinc-400">URSSAF</span>
                <span className="font-bold text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(burden.socialChargesAnnual / 100)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                <span className="text-sm font-medium text-zinc-400">Impôt sur le Revenu</span>
                <span className="font-bold text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(burden.incomeTaxEstimateAnnual / 100)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                <span className="text-sm font-medium text-zinc-400">TVA estimée</span>
                <span className="font-bold text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(vatBurden / 100)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5">
                <span className="text-sm font-medium text-zinc-400">CFE (Provision)</span>
                <span className="font-bold text-white">500,00 €</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-sm font-bold text-indigo-200">Testez un changement de situation</span>
              </div>
              <Link href="/scenarios" className="px-6 py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                Et si ?
              </Link>
            </div>
          </div>
        </details>

        {/* Zone 4 — Barre de fiabilité (Bas de page) */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="p-6 rounded-[2rem] bg-zinc-900/80 border border-white/5 backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-zinc-500">Fiabilité de la projection</span>
              <span className="text-indigo-400">{state.trustReport.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${state.trustReport.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                {state.trustReport.level === 'low' ? 'Estimation initiale' : 
                 state.trustReport.level === 'medium' ? 'Données limitées' : 
                 'Projection fiable'}
              </span>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">
                {monthsWithActuals} mois de données réelles
              </span>
            </div>
          </div>
        </div>

      </div>

      <LedgerEntryModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAdjustingEntry(undefined);
        }}
        onSave={(entry) => {
          addEntry(entry);
          setIsModalOpen(false);
        }}
        onUpdate={(id, updates) => {
          updateEntry(id, updates);
          setIsModalOpen(false);
        }}
        onDelete={(id) => {
          deleteEntry(id);
          setIsModalOpen(false);
        }}
        entry={adjustingEntry}
      />
    </div>
  );
}
