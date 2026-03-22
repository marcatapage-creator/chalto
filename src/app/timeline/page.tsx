'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Filter, Info, ChevronRight } from 'lucide-react';
import { Timeline } from '@/components/Timeline';
import { TimelineDetailPanel } from '@/components/TimelineDetailPanel';
import { TimelineEntry } from '@/models/simulation';
import { UserProfile } from '@/models/user';
import { LedgerEntry } from '@/models/context';
import { LedgerEntryModal } from '@/components/LedgerEntryModal';
import { Ruleset } from '@/models/ruleset';
import ruleset2026 from '@/rulesets/ruleset_2026.json';
import { FiscalContextBuilder } from '@/core/context/fiscal-context-builder';
import { FiscalCalculationEngine } from '@/core/fiscal/fiscal-engine';
import { LiabilityScheduler } from '@/core/fiscal/liability-scheduler';
import { SimulationEngine } from '@/core/engine/simulation-engine';
import { useLedger } from '@/core/ledger/ledger-hook';
import { RevenueBlender } from '@/core/projection/revenue-blender';
import { LedgerToSimulationAdapter } from '@/core/ledger/ledger-to-simulation-adapter';

import { auth } from '@/lib/auth';

export default function TimelinePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [adjustingEntry, setAdjustingEntry] = useState<LedgerEntry | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const savedUser = localStorage.getItem(key);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const { entries, addEntry, updateEntry, deleteEntry, isLoaded: ledgerLoaded } = useLedger();

  if (!user || !ledgerLoaded) return null;

  // 1. Reality Sync via RevenueBlender
  const reality = RevenueBlender.blend(entries, user);

  const context = FiscalContextBuilder.build(user, ruleset2026 as unknown as Ruleset);
  
  // 2. Fiscal & Scheduler based on reality
  const burden = FiscalCalculationEngine.execute(reality.blendedAnnualRevenueCents || 0, context);
  const vatBurden = FiscalCalculationEngine.calculateVat(reality.blendedAnnualRevenueCents || 0, context.ruleset);
  const scheduledLiabilities = LiabilityScheduler.scheduleFiscalBurden(burden, context.ruleset, vatBurden);
  
  // 3. Ledger to Simulation Adaptation
  const { inflows: ledgerInflows, liabilities: ledgerLiabilities } = LedgerToSimulationAdapter.adapt(entries);
  
  const simulation = SimulationEngine.execute(
    user.treasuryCurrentCents,
    ledgerInflows,
    [...ledgerLiabilities, ...scheduledLiabilities.filter(l => !ledgerLiabilities.some(ll => ll.id === l.id))],
    50000,
    reality.confidenceScore
  );

  const totalBurdenCents = burden.socialChargesAnnual + (burden.retirementChargesAnnual || 0) + burden.incomeTaxEstimateAnnual;

  const handleAdjust = (timelineEntry: TimelineEntry) => {
    // 1. Check if it's already in the ledger
    const existing = entries.find(e => e.id === timelineEntry.id || e.sourceForecastId === timelineEntry.id);
    
    if (existing) {
      setAdjustingEntry(existing);
    } else {
      // 2. Materialize a scheduled entry
      const newEntry: LedgerEntry = {
        id: `adj_${timelineEntry.id || Date.now()}`,
        sourceForecastId: timelineEntry.id, // The ID from the engine
        effectiveDate: timelineEntry.date,
        amountCents: Math.abs(timelineEntry.amountCents),
        type: 'social_contribution', // Default
        category: timelineEntry.label,
        status: 'planned',
        source: 'manual_adjustment',
        origin: 'user', // Manual override
        isForecast: true,
        immutable: false,
        monthKey: `${timelineEntry.date.getFullYear()}-${(timelineEntry.date.getMonth()+1).toString().padStart(2, '0')}`
      };
      
      // Correct type based on label
      if (timelineEntry.label.toLowerCase().includes('urssaf')) newEntry.type = 'social_contribution';
      else if (timelineEntry.label.toLowerCase().includes('tva')) newEntry.type = 'vat';
      else if (timelineEntry.label.toLowerCase().includes('impôt')) newEntry.type = 'tax_payment';
      else if (timelineEntry.label.toLowerCase().includes('personal')) newEntry.type = 'personal_drawing';
      else if (timelineEntry.type === 'inflow') newEntry.type = 'revenue';

      setAdjustingEntry(newEntry);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-6 h-6 text-indigo-400" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                Anticipation
              </h1>
            </div>
            <p className="text-zinc-500 text-sm italic font-medium">
              "Suis-je prêt pour mes prochaines échéances ?"
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all">
              Ajuster Provisions
            </button>
          </div>
        </header>

        {/* Readiness Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden group shadow-xl">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
               <Info className="w-16 h-16 text-indigo-400" />
             </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-4">Suis-je prêt ?</div>
            <div className="text-2xl font-bold mb-1 text-white">15 Avril</div>
            <div className="text-sm text-indigo-200/60 font-medium">URSSAF • ~ 1 240 €</div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Couvert</span>
            </div>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] transition-all hover:bg-white/[0.04] shadow-lg">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Provision 2026</div>
            <div className="text-2xl font-bold mb-1 text-white">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalBurdenCents / 100)}
            </div>
            <div className="text-xs text-zinc-600 font-medium">Total estimé à provisionner</div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Risque Fiscal</span>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`w-3 h-1 rounded-full ${i <= 3 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 transition-all hover:bg-rose-500/10 shadow-lg">
            <div className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-bold mb-4">Tension Trésorerie</div>
            <div className="text-2xl font-bold mb-1 text-white">J-25</div>
            <div className="text-sm text-rose-200/60 font-medium">Bascule TVA</div>
            <div className="mt-6">
              <span className="px-2 py-1 rounded bg-rose-500/20 text-[10px] uppercase tracking-widest text-rose-500 font-bold">Vigilance Requise</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.01] rounded-3xl border border-white/[0.05] p-6 sm:p-8">
          <Timeline 
            entries={simulation.timeline} 
            onSelectEntry={(entry) => setSelectedEntry(entry)} 
            onAdjust={handleAdjust}
          />
        </div>

        {/* Adjust Modal */}
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

        {/* Detail Panel */}
        <TimelineDetailPanel 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />

        <div className="mt-12 flex items-start gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.03]">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-500 leading-relaxed italic">
            "Votre timeline est synchronisée avec le moteur de projection. Chaque nouveau revenu ajouté via le bouton [+] recalcule instantanément vos prochaines échéances."
          </div>
        </div>
      </div>
    </div>
  );
}
