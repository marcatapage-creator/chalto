'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../../models/user';
import { Ruleset } from '../../models/ruleset';
import ruleset2026 from '../../rulesets/ruleset_2026.json';
import { FiscalContextBuilder } from '../../core/context/fiscal-context-builder';
import { RevenueProjectionEngine } from '../../core/projection/projection-engine';
import { FiscalCalculationEngine } from '../../core/fiscal/fiscal-engine';
import { SimulationEngine } from '../../core/engine/simulation-engine';
import { LiabilityScheduler } from '../../core/fiscal/liability-scheduler';
import { DashboardPresenter } from '../../core/presentation/dashboard-presenter';
import { InflowPredictor } from '../../core/engine/inflow-predictor';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { auth } from '@/lib/auth';

export default function ScorePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const savedUser = localStorage.getItem(key);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/onboarding');
    }
  }, [router]);

  if (!user) return null;

  // Calculate scores (similar to dashboard logic but focused on reveal)
  const context = FiscalContextBuilder.build(user, ruleset2026 as unknown as Ruleset);
  const projection = RevenueProjectionEngine.execute(context, []);
  const burden = FiscalCalculationEngine.execute(projection.annualProjectionCents || 0, context);
  const vatBurden = FiscalCalculationEngine.calculateVat(projection.annualProjectionCents || 0, context.ruleset);
  const scheduledLiabilities = LiabilityScheduler.scheduleFiscalBurden(burden, context.ruleset, vatBurden);
  const predictedInflows = InflowPredictor.predict(projection.annualProjectionCents || 0, context, projection.confidence);
  
  const simulation = SimulationEngine.execute(
    user.treasuryCurrentCents,
    predictedInflows,
    scheduledLiabilities,
    50000,
    80 // High confidence default for score reveal
  );

  const safeToSpendMensuel = simulation.safeToSpendCents / 12;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 py-20 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-8 animate-in zoom-in duration-700">
          <ShieldCheck className="w-3 h-3" />
          <span>Analyse terminée</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Voici votre capacité réelle.</h1>
        <p className="text-zinc-500 mb-12 text-lg">Nous avons calculé votre marge de manœuvre pour 2026.</p>

        <div className="grid grid-cols-1 gap-6 mb-12">
          {/* Main Card */}
          <div className="p-10 rounded-[40px] bg-white text-black shadow-2xl shadow-indigo-500/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Safe-to-Spend Mensuel</p>
            <div className="text-6xl md:text-7xl font-bold tracking-tighter mb-4">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(safeToSpendMensuel / 100)}
            </div>
            <p className="text-zinc-600 font-medium max-w-md mx-auto">
              C'est le montant que vous pouvez dépenser chaque mois sans jamais manquer de trésorerie pour vos impôts.
            </p>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Provision Fiscale</p>
              <div className="text-2xl font-bold text-white">
                ~{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((burden.socialChargesAnnual + burden.retirementChargesAnnual) / 12 / 100)} / mois
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Indice de Confiance</p>
              <div className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                82%
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          className="group w-full py-6 rounded-[24px] bg-indigo-600 text-white font-bold text-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95"
        >
          Accéder à mon Dashboard
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
