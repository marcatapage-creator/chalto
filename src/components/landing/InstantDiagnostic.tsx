'use client';

import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DiagnosticResult {
  safeToSpendCents: number;
  provisionCents: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export function InstantDiagnostic({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState<string>('');
  const [status, setStatus] = useState<'BNC' | 'Micro' | 'Artist'>('Micro');
  
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const calculateDiagnostic = () => {
    setLoading(true);
    // Simple logic for the diagnostic (not the full engine)
    setTimeout(() => {
      const rev = parseInt(revenue) || 0;
      const revCents = rev * 100;
      
      let rate = 0.25; // Default for Micro
      if (status === 'BNC') rate = 0.45;
      if (status === 'Artist') rate = 0.20;

      const monthlyProvision = (revCents / 12) * rate;
      const safeToSpend = (revCents / 12) * (1 - rate);
      
      setResult({
        safeToSpendCents: safeToSpend,
        provisionCents: monthlyProvision,
        riskLevel: rev > 80000 ? 'medium' : 'low'
      });
      setLoading(false);
      setStep('result');
    }, 1200);
  };

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl animate-in zoom-in duration-500">
          <div className="p-8 md:p-12 rounded-[32px] bg-zinc-900/50 border border-white/5 backdrop-blur-xl mb-8">
            <h2 className="text-3xl font-bold mb-8 text-white">Votre diagnostic éclair</h2>
            
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm font-medium text-indigo-400 mb-1 uppercase tracking-wider">Safe-to-Spend Mensuel</p>
                <div className="text-4xl font-bold text-white">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(result.safeToSpendCents / 100)}
                </div>
                <p className="text-xs text-zinc-500 mt-2">C'est ce que vous pouvez vous verser sereinement.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Provision Recommandée</p>
                  <div className="text-xl font-bold text-white">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(result.provisionCents / 100)}
                  </div>
                </div>
                
                <div className={`p-6 rounded-2xl border ${
                  result.riskLevel === 'low' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Indicateur de Tension</p>
                  <div className={`text-xl font-bold flex items-center gap-2 ${
                    result.riskLevel === 'low' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {result.riskLevel === 'low' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {result.riskLevel === 'low' ? 'Sain' : 'Vigilance'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.push('/onboarding')}
              className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              Débloquer mon analyse complète
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onBack}
              className="w-full py-4 text-zinc-500 font-medium hover:text-white transition-colors"
            >
              Recommencer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        <div className="p-8 md:p-12 rounded-[32px] bg-zinc-900/50 border border-white/5 backdrop-blur-xl">
          <h2 className="text-3xl font-bold mb-2 text-white">Quelques secondes pour y voir clair.</h2>
          <p className="text-zinc-400 mb-10">Estimation basée sur les taux 2026.</p>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Chiffre d'Affaires Annuel Estimé</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="ex: 45000"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-600">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Statut Fiscal</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Micro', 'BNC', 'Artist'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      status === s 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={!revenue || loading}
              onClick={calculateDiagnostic}
              className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Calculer mon diagnostic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
