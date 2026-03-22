'use client';

import React from 'react';
import { ShieldCheck, Info, Zap, AlertTriangle, ChevronRight, Calculator, FileText, Database } from 'lucide-react';
import { useLedger } from '@/core/ledger/ledger-hook';
import { TrustEngine } from '@/core/engine/trust-engine';
import { UserProfile } from '@/models/user';
import { useRouter } from 'next/navigation';

import { auth } from '@/lib/auth';

export default function HypothesesPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const { entries, getYearToDateCashFlow, isLoaded } = useLedger();

  React.useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const savedUser = localStorage.getItem(key);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!isLoaded || !user) return null;

  const stats = getYearToDateCashFlow();
  const trustReport = TrustEngine.calculateReliability(
    stats.totalInflowHT,
    user.estimatedAnnualRevenueCents || 0
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header Section */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mes Hypothèses</h1>
          </div>
          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            La transparence est au cœur du copilote. Ici, nous vous montrons comment nous calculons vos provisions et quel crédit accorder à nos projections actuelles.
          </p>
        </header>

        {/* Level 0: Global Reliability Index */}
        <section className="mb-16">
          <div className={`p-8 rounded-[2rem] border transition-all backdrop-blur-xl ${
            trustReport.level === 'high' ? 'bg-emerald-500/5 border-emerald-500/10' : 
            trustReport.level === 'medium' ? 'bg-amber-500/5 border-amber-500/10' : 
            'bg-rose-500/5 border-rose-500/10'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Indice de Fiabilité Globale</h2>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className={`text-7xl font-black tracking-tighter ${
                    trustReport.level === 'high' ? 'text-emerald-400' : 
                    trustReport.level === 'medium' ? 'text-amber-400' : 
                    'text-rose-400'
                  }`}>
                    {trustReport.score}%
                  </span>
                  <span className="text-xl font-bold text-zinc-500">Précision</span>
                </div>
                <p className="text-sm text-zinc-400 max-w-sm">
                  {trustReport.level === 'high' ? 'Vos données sont solides. Les projections sont hautement actionnables.' : 
                   trustReport.level === 'medium' ? 'Données partielles. Nous appliquons une marge de sécurité modérée.' : 
                   'Basé sur beaucoup d\'estimations. Le mode prudent est activé.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {trustReport.missingDataPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-400">
                    <AlertTriangle className="w-4 h-4 text-rose-500/50" />
                    {point}
                  </div>
                ))}
                {trustReport.missingDataPoints.length === 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    Toutes les variables clés sont synchronisées.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Level 1: User Clarity (The Provision Rate) */}
        <section className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-6">Niveau 1 : Ma Stratégie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Taux Mixte Provisionné</h3>
              <p className="text-4xl font-black text-white mb-4">~45,2%</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                C'est le pourcentage moyen que nous isolons sur chaque euro HT encaissé pour couvrir vos charges (URSSAF, Retraite, Impôts).
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Impact Safe-to-Spend</h3>
              <p className="text-4xl font-black text-white mb-4">{user.safetyMarginBps / 100}%</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Votre marge de sécurité personnelle. Nous ne vous recommandons de dépenser que {user.safetyMarginBps / 100}% de ce qu'il reste après taxes.
              </p>
            </div>
          </div>
        </section>

        {/* Level 2: Engine Logic (The Ruleset) */}
        <section className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-6">Niveau 2 : Le Moteur Fiscal (2026)</h2>
          <div className="space-y-4">
            {[
              { label: 'URSSAF Automatique', value: '21,10%', note: 'Activités Libérales BNC - Taux standard' },
              { label: 'Correction RAAP (Retraite)', value: '8,00%', note: 'Assiette 100% du CA après abattement' },
              { label: 'Formation Professionnelle', value: '0,20%', note: 'CFP - Contribution annuelle' },
              { label: 'Seuil Franchise de TVA', value: '39 100€', note: 'Alerte à 36 800€ (Prégérance)' },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] transition-all">
                <div>
                  <div className="text-sm font-semibold text-zinc-200">{rule.label}</div>
                  <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest mt-0.5">{rule.note}</div>
                </div>
                <div className="text-lg font-mono font-bold text-indigo-400">{rule.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Level 3: Expert (Technical Scaling) */}
        <section className="mb-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 mb-6">Niveau 3 : Architecture Technique</h2>
          <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Lissage Linéaire ("Preuve par 12")</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Le moteur ne se contente pas de regarder le mois en cours. Il simule une année pleine 
                  en mélangeant votre **réalité (ledger)** et vos **prédictions (forecast)** pour éviter 
                  les effets de bord en cas de gros encaissements ponctuels.
                </p>
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b border-indigo-400/20 pb-1 cursor-pointer hover:border-indigo-400 transition-all">
                  Consulter la documentation technique (Ruleset 2026.1)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="pt-12 border-t border-white/5 flex justify-between items-center text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
          <div>Version 1.0.4 // Engine Stable</div>
          <button onClick={() => router.back()} className="hover:text-white transition-colors flex items-center gap-2">
            Retour au pilotage <ChevronRight className="w-3 h-3" />
          </button>
        </footer>
      </div>
    </div>
  );
}
