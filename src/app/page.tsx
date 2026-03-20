import React from 'react';
import { UserProfile } from '../models/user';
import { Ruleset } from '../models/ruleset';
import ruleset2026 from '../rulesets/ruleset_2026.json';
import { FiscalContextBuilder } from '../core/context/fiscal-context-builder';
import { RevenueProjectionEngine } from '../core/projection/projection-engine';
import { FiscalCalculationEngine } from '../core/fiscal/fiscal-engine';
import { LiabilityScheduler } from '../core/fiscal/liability-scheduler';
import { InflowPredictor } from '../core/engine/inflow-predictor';
import { SimulationEngine } from '../core/engine/simulation-engine';
import { DashboardPresenter } from '../core/presentation/dashboard-presenter';

import { Hero } from '../components/Hero';
import { Timeline } from '../components/Timeline';
import { Info, TrendingUp, Landmark } from 'lucide-react';

// Mock User for Demonstration
const mockUser: UserProfile = {
  fiscalStatus: 'micro',
  activityType: 'services',
  vatStatus: false,
  treasuryCurrentCents: 1200000, // 12k€
  revenueYTDCents: 3500000,    // 35k€ YTD
  monthsElapsed: 6,
  incomePattern: 'variable',
  hasACRE: false,
  hasVersementLiberatoire: false,
  taxHouseholdParts: 1,
  safetyMarginBps: 9000,
};

export default function ChaltoDashboard() {
  // 1. Pipeline Execution
  const context = FiscalContextBuilder.build(mockUser, ruleset2026 as unknown as Ruleset);
  
  // Projection (Mocking some monthly data for the engine)
  const monthlyRevenue = [500000, 600000, 400000, 700000, 600000, 700000];
  const projection = RevenueProjectionEngine.execute(context, monthlyRevenue);
  
  // Fiscal & Scheduler
  const burden = FiscalCalculationEngine.execute(projection.annualProjectionCents || 0, context);
  const scheduledLiabilities = LiabilityScheduler.scheduleFiscalBurden(burden, context.ruleset);
  
  // Future Inflows
  const predictedInflows = InflowPredictor.predict(projection.annualProjectionCents || 0, context);
  
  // Final Simulation
  const simulation = SimulationEngine.execute(
    mockUser.treasuryCurrentCents,
    predictedInflows,
    scheduledLiabilities,
    50000 // 500€ safety floor
  );

  const state = DashboardPresenter.present(context, projection, burden, simulation);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 rotate-12 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">C</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Chalto
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
            Mars 2026 — Copilote Fiscal
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Hero & Insights */}
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
            <Hero 
              amountCents={state.safeToSpendCents} 
              headline={state.headline}
              riskLevel={state.riskLevel}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 text-zinc-100">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-sm">Prévu pour l'année</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((state.annualProjectionCents || 0) / 100)}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Basé sur votre historique et un pattern {mockUser.incomePattern}. 
                  Confidence: {state.projectionConfidence}.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 text-zinc-100">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-sm">Provision Fiscale</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(state.remainingFiscalLiabilityCents / 100)}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Estimation totale pour 2026 (Impôts + Charges). 
                  Étalé selon le calendrier fiscal.
                </p>
              </div>
            </div>

            {/* Explanation / Pedagogy */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-200/80">
              <Info className="w-6 h-6 shrink-0 text-indigo-400" />
              <div className="text-sm leading-relaxed italic">
                "{state.explanation}"
              </div>
            </div>
          </div>

          {/* Right Column: Timeline / Payments */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-8">
            <Timeline entries={simulation.timeline} />
          </div>

        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-12 border-t border-zinc-900 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Chalto // Détecteur de clarté logicielle // 2026
        </footer>
      </div>
    </div>
  );
}
