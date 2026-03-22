'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Zap, AlertCircle, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { UserProfile } from '@/models/user';
import { useRouter } from 'next/navigation';
import { FiscalContextBuilder } from '@/core/context/fiscal-context-builder';
import { FiscalCalculationEngine } from '@/core/fiscal/fiscal-engine';
import { Ruleset } from '@/models/ruleset';
import ruleset2026 from '@/rulesets/ruleset_2026.json';
import { roundToEuro } from '@/models/monetary';
import { LedgerService } from '@/core/ledger/ledger-service';

import { auth } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'fiscal' | 'safety' | 'account'>('fiscal');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null); // Keep pendingUser for preview logic
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      setEditedUser(parsed);
      setPendingUser(parsed); // Initialize pendingUser as well
    } else {
      router.push('/onboarding');
    }
  }, [router]);

  const handleSave = () => {
    if (editedUser) {
      const key = auth.getStorageKey('chalto_user_profile');
      localStorage.setItem(key, JSON.stringify(editedUser));
      setUser(editedUser);
      setIsEditing(false);
    }
  };

  if (!user || !pendingUser) return null;

  const handleToggleTVA = () => {
    const updated = { ...pendingUser, vatStatus: !pendingUser.vatStatus };
    setPendingUser(updated);
    setShowPreview(true);
  };

  const handleToggleRegime = () => {
    const updated = { ...pendingUser, fiscalStatus: pendingUser.fiscalStatus === 'micro' ? 'bnc' : 'micro' as any };
    setPendingUser(updated);
    setShowPreview(true);
  };

  const saveProfile = () => {
    localStorage.setItem('chalto_user_profile', JSON.stringify(pendingUser));
    
    // Sync Ledger Forecasts if revenue/expenses changed
    const currentLedger = localStorage.getItem('chalto_ledger_entries');
    if (currentLedger) {
      const parsedLedger = JSON.parse(currentLedger);
      const updatedLedger = LedgerService.reSeedForecasts(pendingUser, parsedLedger);
      localStorage.setItem('chalto_ledger_entries', JSON.stringify(updatedLedger));
    }

    setUser(pendingUser);
    setShowPreview(false);
    // Reload to refresh all contexts
    window.location.reload();
  };

  // Logic for Impact Preview Calculation
  const calculateImpact = (u: UserProfile) => {
    const context = FiscalContextBuilder.build(u, ruleset2026 as unknown as Ruleset);
    const revenue = u.estimatedAnnualRevenueCents || 0;
    const burden = FiscalCalculationEngine.execute(revenue, context);
    const vat = u.vatStatus ? FiscalCalculationEngine.calculateVat(revenue, context.ruleset) : 0;
    const total = burden.socialChargesAnnual + burden.incomeTaxEstimateAnnual + vat;
    const net = revenue - total;
    return { total, net };
  };

  const currentImpact = calculateImpact(user);
  const pendingImpact = calculateImpact(pendingUser);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil Fiscal</h1>
          </div>
          <p className="text-zinc-500 max-w-2xl">
            Votre socle de décision. Toute modification ici impactera instantanément vos calculs de safe-to-spend et vos provisions.
          </p>
        </header>

        <div className="space-y-8">
          {/* Section: Identity */}
          <section className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05]">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8">Configuration Moteur</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div>
                    <div className="text-sm font-semibold">Régime Fiscal</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">
                      {pendingUser.fiscalStatus === 'micro' ? 'Micro-BNC (Auto-entrepreneur)' : 'BNC (Déclarations contrôlées)'}
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleRegime}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
                  >
                    Changer
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div>
                    <div className="text-sm font-semibold">Assujettissement TVA</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">
                      {pendingUser.vatStatus ? 'En activité (Facturation TVA)' : 'Franchise en base (Pas de TVA)'}
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleTVA}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
                  >
                    {pendingUser.vatStatus ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">C.A. annuel estimé (HT)</label>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Projection de base</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      value={Math.round((pendingUser.estimatedAnnualRevenueCents || 0) / 100)}
                      onChange={(e) => setPendingUser({ ...pendingUser, estimatedAnnualRevenueCents: Number(e.target.value) * 100 })}
                      onBlur={() => setShowPreview(true)}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-indigo-400 font-bold outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <span className="text-zinc-600 font-bold text-sm">€</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">Besoins Mensuels (Perso)</label>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Base Safe-to-spend</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      value={Math.round(pendingUser.personalMonthlyExpensesCents / 100)}
                      onChange={(e) => setPendingUser({ ...pendingUser, personalMonthlyExpensesCents: Number(e.target.value) * 100 })}
                      onBlur={() => setShowPreview(true)}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-indigo-400 font-bold outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <span className="text-zinc-600 font-bold text-sm">€</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-bold">Sécurité du Modèle</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Le moteur utilise le ruleset **CHALTO-2026.1**. Vos charges sont calculées selon les derniers barèmes URSSAF et IR connus.
                </p>
              </div>
            </div>
          </section>

          {/* Section: History placeholder */}
          <section className="flex items-center gap-3 text-zinc-600 text-[10px] font-bold uppercase tracking-widest px-8">
            <RotateCcw className="w-3 h-3" />
            Dernière modification : {new Date().toLocaleDateString()} • Version 1.0.4
          </section>
        </div>

        {/* Impact Preview Overlay */}
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPreview(false)} />
            
            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-indigo-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Aperçu de l'Impact</h3>
                </div>

                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                  Changer votre configuration fiscale modifie instantanément votre reste-à-vivre et vos obligations. Voici la simulation :
                </p>

                <div className="space-y-4 mb-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Charges Annuelles</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-zinc-600">{roundToEuro(currentImpact.total).toLocaleString()}€</span>
                        <ArrowRight className="w-3 h-3 text-rose-500" />
                        <span className="text-lg font-bold text-rose-400">{roundToEuro(pendingImpact.total).toLocaleString()}€</span>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Net Annuel (Est.)</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-zinc-600">{roundToEuro(currentImpact.net).toLocaleString()}€</span>
                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-lg font-bold text-emerald-400">{roundToEuro(pendingImpact.net).toLocaleString()}€</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200/60 leading-relaxed italic">
                      Attention : Cette modification entraînera un recalcul complet de votre Timeline et de votre Safe-to-Spend.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setPendingUser(user); setShowPreview(false); }}
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Annuler
                  </button>
                  <button 
                    onClick={saveProfile}
                    className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4" /> Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
