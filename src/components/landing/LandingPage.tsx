'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Shield, Zap, TrendingUp, ArrowRight, Calculator } from 'lucide-react';
import { InstantDiagnostic } from '@/components/landing/InstantDiagnostic';

export function LandingPage() {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  if (showDiagnostic) {
    return <InstantDiagnostic onBack={() => setShowDiagnostic(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[100px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Chalto</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
            <Link href="/onboarding" className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-semibold shadow-xl shadow-white/5 active:scale-95">
              Essai gratuit
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-32 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-in fade-in zoom-in duration-700">
            <Zap className="w-3 h-3" />
            <span>Copilote financier pour freelances français</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Dépensez l'esprit <br /> <span className="text-white">vraiment tranquille.</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Chalto vous montre exactement ce que vous pouvez dépenser sans risque, 
            ce que vous devez mettre de côté et quand payer vos impôts.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <button 
              onClick={() => setShowDiagnostic(true)}
              className="group px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-2 active:scale-95"
            >
              Estimer ma situation en 30s
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-zinc-500 italic">Sans carte bancaire. Sans inscription.</p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <div className="p-8 rounded-3xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">Zéro stress fiscal</h3>
            <p className="text-zinc-400 leading-relaxed">
              Anticipez l'URSSAF, la TVA et l'impôt sur le revenu mois par mois. Plus jamais de mauvaise surprise.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">Safe-to-Spend</h3>
            <p className="text-zinc-400 leading-relaxed">
              Sachez instantanément combien vous pouvez vous verser ou réinvestir sans mettre en péril votre trésorerie.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-4">Pilotage Temps Réel</h3>
            <p className="text-zinc-400 leading-relaxed">
              Vos prévisions s'ajustent automatiquement à votre réalité bancaire. La clarté remplace l'incertitude.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="relative p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Prêt à reprendre le contrôle ?</h2>
            <Link 
              href="/onboarding"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-zinc-100 transition-all shadow-2xl active:scale-95"
            >
              Démarrer gratuitement
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>

        <footer className="mt-32 pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Chalto</span>
          </div>
          <p className="text-xs text-zinc-600 uppercase tracking-widest">
            © 2026 Chalto // Intelligence Financière pour Freelances
          </p>
        </footer>
      </div>
    </div>
  );
}
