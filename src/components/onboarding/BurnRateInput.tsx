'use client';

import React, { useState } from 'react';
import { ArrowRight, Home, ShoppingCart, Coffee, SkipForward } from 'lucide-react';
import { ConfidenceSelector } from './ConfidenceSelector';
import { ConfidenceLevel } from '../../models/user';

interface BurnRateInputProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function BurnRateInput({ data, onUpdate, onNext }: BurnRateInputProps) {
  const [value, setValue] = useState(data.personalMonthlyExpensesCents / 100 || 2000);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(data.confidence?.expenses || 'estimated');

  const handleNext = () => {
    onUpdate({ 
      personalMonthlyExpensesCents: value * 100,
      confidence: { ...data.confidence, expenses: confidence }
    });
    onNext();
  };

  const ranges = [
    { label: 'Essentiel', val: 1500, desc: 'Loyer + Alimentaire basique' },
    { label: 'Confort', val: 2500, desc: 'Loisirs + Sorties régulières' },
    { label: 'Serein', val: 4000, desc: 'Épargne + Projets + Famille' },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">De combien avez-vous besoin pour vivre ?</h2>
        <p className="text-zinc-500 text-lg">Estimation de vos dépenses personnelles mensuelles.</p>
      </div>

      <div className="space-y-8">
        <div className="relative group">
          <input 
            type="number"
            value={value || ''}
            onChange={(e) => setValue(Number(e.target.value))}
            autoFocus
            className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-6 py-8 text-5xl font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all text-center"
            placeholder="0"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-semibold text-zinc-500">€ / mois</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ranges.map((r) => (
            <button
              key={r.val}
              onClick={() => setValue(r.val)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                value === r.val 
                  ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                  : 'bg-white/2 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`font-bold ${value === r.val ? 'text-white' : 'text-zinc-300'}`}>{r.label}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{r.val}€</div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Home className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <ShoppingCart className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Coffee className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Pensez au loyer, à l'alimentation, aux transports et à vos abonnements. 
            C'est votre <span className="text-zinc-300 font-medium">"Burn Rate"</span>.
          </p>
        </div>

        <ConfidenceSelector value={confidence} onChange={setConfidence} />
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleNext}
          className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all group"
        >
          Voir ma projection
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
