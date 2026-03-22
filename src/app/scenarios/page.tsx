'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, TrendingUp, Info, ArrowRight, RefreshCcw } from 'lucide-react';
import { UserProfile } from '@/models/user';
import { Ruleset } from '@/models/ruleset';
import ruleset2026 from '@/rulesets/ruleset_2026.json';
import { FiscalContextBuilder } from '@/core/context/fiscal-context-builder';
import { RevenueProjectionEngine } from '@/core/projection/projection-engine';
import { FiscalCalculationEngine } from '@/core/fiscal/fiscal-engine';
import { SimulationEngine } from '@/core/engine/simulation-engine';
import { LiabilityScheduler } from '@/core/fiscal/liability-scheduler';
import { InflowPredictor } from '@/core/engine/inflow-predictor';
import { MoneyCents } from '@/models/monetary';
import { FreelancerStatus } from '@/models/fiscal';

import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ScenariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueAdj, setRevenueAdj] = useState(20); // +20%
  const [tempStatus, setTempStatus] = useState<FreelancerStatus | null>(null);

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

  if (loading || !user) return null;

  const currentStatus = tempStatus || user.fiscalStatus;

  const runSimulation = (revenue: MoneyCents, status: FreelancerStatus) => {
    const mockUser = { ...user, fiscalStatus: status, estimatedAnnualRevenueCents: revenue };
    const context = FiscalContextBuilder.build(mockUser, ruleset2026 as unknown as Ruleset);
    const projection = RevenueProjectionEngine.execute(context, []);
    const burden = FiscalCalculationEngine.execute(revenue, context);
    const vatBurden = FiscalCalculationEngine.calculateVat(revenue, context.ruleset);
    const scheduledLiabilities = LiabilityScheduler.scheduleFiscalBurden(burden, context.ruleset, vatBurden);
    const predictedInflows = InflowPredictor.predict(revenue, context, 'HIGH');
    
    return SimulationEngine.execute(user.treasuryCurrentCents, predictedInflows, scheduledLiabilities, 50000);
  };

  const baseRevenue = user.estimatedAnnualRevenueCents || 4500000;
  const baseSim = runSimulation(baseRevenue, user.fiscalStatus);
  
  const hypoRevenue = Math.round(baseRevenue * (1 + revenueAdj / 100));
  const hypoSim = runSimulation(hypoRevenue, currentStatus);

  const formatEuro = (cents: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Scénarios
            </h1>
          </div>
          <p className="text-zinc-500 text-sm italic">
            "Et si mon chiffre d'affaires variait ?" — Pilotez l'incertitude.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Base Scenario Card */}
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Actuel • {user?.fiscalStatus}</span>
            </div>
            <h3 className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Base Réelle</h3>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-2">{formatEuro(baseRevenue)}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Revenu Estimé</div>
            </div>
            <div className="space-y-3 pb-4 border-b border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Safe-to-spend</span>
                <span className="text-emerald-400 font-medium">{formatEuro(baseSim.safeToSpendCents / 12)} / m</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Fiscalité totale</span>
                <span className="text-rose-400 font-medium">~{formatEuro((baseRevenue - baseSim.safeToSpendCents) / 12)} / m</span>
              </div>
            </div>
          </div>

          {/* Hypo Scenario Card */}
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group ring-1 ring-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[8px] uppercase tracking-widest border border-indigo-500/20">Simulation</span>
            </div>
            <h3 className="text-indigo-400 text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Hypothèse {revenueAdj > 0 ? '+' : ''}{revenueAdj}%</h3>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-2 italic">{formatEuro(hypoRevenue)}</div>
              <div className="text-[10px] text-indigo-400/50 uppercase tracking-widest">{currentStatus.toUpperCase()}</div>
            </div>
            <div className="space-y-3 pb-4 border-b border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Safe-to-spend</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-medium">{formatEuro(hypoSim.safeToSpendCents / 12)} / m</span>
                  <div className={`px-1.5 py-0.5 rounded-lg text-[9px] ${hypoSim.safeToSpendCents > baseSim.safeToSpendCents ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {Math.round((hypoSim.safeToSpendCents / baseSim.safeToSpendCents - 1) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/[0.05] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-50" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-semibold">Piloter l'hypothèse</h2>
              </div>
              <button 
                onClick={() => {
                  setRevenueAdj(20);
                  setTempStatus(null);
                }}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-600 hover:text-white transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-12">
              <div>
                <div className="flex justify-between items-end mb-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Variabilité du Chiffre d'Affaires</label>
                  <span className={`text-4xl font-mono font-bold ${revenueAdj >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {revenueAdj > 0 ? '+' : ''}{revenueAdj}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-50" 
                  max="100" 
                  step="5"
                  value={revenueAdj}
                  onChange={(e) => setRevenueAdj(Number(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-zinc-700 uppercase tracking-widest mt-6 font-bold">
                  <span>Baisse (-50%)</span>
                  <span>Linéaire</span>
                  <span>Croissance (+100%)</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Régime comparatif</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['micro', 'bnc', 'artiste'] as FreelancerStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTempStatus(s === user?.fiscalStatus ? null : s)}
                      className={`p-4 rounded-2xl border transition-all text-xs font-bold uppercase tracking-widest ${
                        (tempStatus === s || (tempStatus === null && user?.fiscalStatus === s))
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                          : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MES HYPOTHÈSES (Model Transparency) */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Mes Hypothèses</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-bold">Modèle de Revenu</div>
              <div className="text-sm text-zinc-300">Linéaire ({user?.incomePattern})</div>
              <p className="text-[10px] text-zinc-500 mt-2 italic">Basé sur une répartition égale du CA prévisionnel sur 12 mois.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-bold">Règles Fiscales</div>
              <div className="text-sm text-zinc-300">Règlementation {ruleset2026.year}</div>
              <p className="text-[10px] text-zinc-500 mt-2 italic">Taux URSSAF: 23,1%, TVA: 20%. Barèmes IR 2026 appliqués.</p>
            </div>
          </div>
        </section>

        <div className="mt-12 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-200/60 italic leading-relaxed">
          "Les scénarios vous permettent de tester la résilience de votre structure. Chalto utilise vos données réelles consolidées comme base de comparaison pour chaque hypothèse."
        </div>
      </div>
    </div>
  );
}
