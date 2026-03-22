'use client';

import React, { useState } from 'react';
import { IncomeEstimationMethod } from '../../models/user';
import { ArrowRight, Info, SkipForward } from 'lucide-react';
import { ConfidenceSelector } from './ConfidenceSelector';
import { ConfidenceLevel } from '../../models/user';

interface IncomeInputProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function IncomeInput({ data, onUpdate, onNext }: IncomeInputProps) {
  const [value, setValue] = useState(data.revenueYTDCents / 100 || 0);
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isTtc, setIsTtc] = useState(false);
  const [comparison, setComparison] = useState<'similar' | 'lower' | 'higher'>('similar');
  const [confidence, setConfidence] = useState<ConfidenceLevel>(data.confidence?.revenue || 'estimated');

  const method = data.incomeEstimationMethod as IncomeEstimationMethod;

  const handleNext = () => {
    let baseValue = value;
    if (isTtc) {
      baseValue = value / 1.2;
    }

    let revenueCents = baseValue * 100;
    if ((period === 'monthly' && method === 'known') || method === 'estimate') {
      revenueCents = baseValue * 100 * 12; // Project annual from monthly/estimate
    }
    
    onUpdate({ 
      estimatedAnnualRevenueCents: revenueCents,
      revenueYTDCents: 0,
      monthsElapsed: 0,
      revenueLastYearCents: method === 'last_year' ? baseValue * 100 : undefined,
      incomePattern: method === 'estimate' ? 'variable' : 'stable',
      vatStatus: isTtc, // If they enter TTC, they are likely VAT registered
      confidence: { ...data.confidence, revenue: confidence }
    });
    onNext();
  };

  const renderKnown = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 transition-all duration-500">
      <div className="flex bg-white/5 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${period === 'monthly' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Mensuel
        </button>
        <button 
          onClick={() => setPeriod('annual')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${period === 'annual' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Annuel
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-zinc-400 text-sm font-medium">Votre revenu {isTtc ? 'TTC' : 'HT'} {period === 'monthly' ? 'par mois' : 'par an'}</label>
          <div className="flex p-0.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <button
              type="button"
              onClick={() => setIsTtc(false)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!isTtc ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              HT
            </button>
            <button
              type="button"
              onClick={() => setIsTtc(true)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isTtc ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              TTC
            </button>
          </div>
        </div>
        <div className="relative group">
          <input 
            type="number"
            value={value || ''}
            onChange={(e) => setValue(Number(e.target.value))}
            autoFocus
            className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-6 py-5 text-4xl font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
            placeholder="0"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-semibold text-zinc-500">€</div>
        </div>
        {isTtc && value > 0 && (
          <p className="text-[10px] text-indigo-400/60 mt-2 italic">
            Soit environ {(value / 1.2).toFixed(2)}€ HT. Toutes les projections fiscales seront basées sur le montant HT.
          </p>
        )}
      </div>
    </div>
  );

  const renderEstimate = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 transition-all duration-500">
      <div className="grid grid-cols-1 gap-3">
        {[2000, 3000, 5000, 8000].map((val) => (
          <button
            key={val}
            onClick={() => setValue(val)}
            className={`p-4 rounded-xl border text-left transition-all ${
              value === val ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20'
            }`}
          >
            Environ {val.toLocaleString()}€ / mois
          </button>
        ))}
      </div>
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0" />
        <p className="text-sm text-indigo-300/80 leading-relaxed font-medium">
          Pas besoin d'être précis. Nous ajusterons au fur et à mesure de vos encaissements réels.
        </p>
      </div>
    </div>
  );

  const renderLastYear = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 transition-all duration-500">
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-zinc-400 text-sm font-medium">Revenu annuel {isTtc ? 'TTC' : 'HT'} de l'an dernier (C.A.)</label>
          <div className="flex p-0.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <button
              type="button"
              onClick={() => setIsTtc(false)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!isTtc ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              HT
            </button>
            <button
              type="button"
              onClick={() => setIsTtc(true)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isTtc ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              TTC
            </button>
          </div>
        </div>
        <div className="relative">
          <input 
            type="number"
            value={value || ''}
            onChange={(e) => setValue(Number(e.target.value))}
            autoFocus
            className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-6 py-5 text-4xl font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
            placeholder="0"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-semibold text-zinc-500">€</div>
        </div>
        {isTtc && value > 0 && (
          <p className="text-[10px] text-indigo-400/60 mt-2 italic">
            Soit environ {(value / 1.2).toFixed(2)}€ HT. Toutes les projections fiscales seront basées sur le montant HT.
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        <label className="text-zinc-400 text-sm font-medium">Cette année sera-t-elle...</label>
        <div className="flex gap-2">
          {['Similaire', 'Plus basse', 'Plus haute'].map((label, i) => {
            const id = ['similar', 'lower', 'higher'][i] as any;
            return (
              <button
                key={id}
                onClick={() => setComparison(id)}
                className={`flex-1 py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                  comparison === id ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold tracking-tight text-white">
        {method === 'known' && "Quel est votre revenu habituel ?"}
        {method === 'estimate' && "Donnez-ne une fourchette large"}
        {method === 'last_year' && "Par rapport à l'année dernière"}
      </h2>
      
      {method === 'known' && renderKnown()}
      {method === 'estimate' && renderEstimate()}
      {method === 'last_year' && renderLastYear()}

      <ConfidenceSelector value={confidence} onChange={setConfidence} />

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleNext}
          className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all group"
        >
          Continuer
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={onNext}
          className="w-full py-4 text-zinc-500 font-medium hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Passer cette étape
        </button>
      </div>
    </div>
  );
}
