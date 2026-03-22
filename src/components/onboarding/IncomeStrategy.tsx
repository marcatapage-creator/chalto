'use client';

import React from 'react';
import { IncomeEstimationMethod } from '../../models/user';
import { Target, Calculator, History } from 'lucide-react';

interface IncomeStrategyProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function IncomeStrategy({ data, onUpdate, onNext }: IncomeStrategyProps) {
  const options = [
    { id: 'known' as IncomeEstimationMethod, label: 'Je connais mes revenus', desc: 'Mensuel ou annuel fixe', icon: Target },
    { id: 'estimate' as IncomeEstimationMethod, label: 'Je veux estimer', desc: 'Fourchette ou revenus variables', icon: Calculator },
    { id: 'last_year' as IncomeEstimationMethod, label: 'Utiliser l\'année passée', desc: 'Basé sur votre dernier CA', icon: History },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Comment souhaitez-vous estimer vos revenus ?</h2>
        <p className="text-zinc-500">Nous adapterons les outils de saisie à votre situation.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              onUpdate({ incomeEstimationMethod: opt.id });
              onNext();
            }}
            className={`group relative flex items-center gap-4 p-6 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
              data.incomeEstimationMethod === opt.id 
                ? 'bg-indigo-500/10 border-indigo-500/50' 
                : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20'
            }`}
          >
            {/* Hover reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className={`p-3 rounded-xl transition-colors ${
              data.incomeEstimationMethod === opt.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300'
            }`}>
              <opt.icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <div className={`font-bold text-lg ${data.incomeEstimationMethod === opt.id ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                {opt.label}
              </div>
              <div className="text-sm text-zinc-500">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
