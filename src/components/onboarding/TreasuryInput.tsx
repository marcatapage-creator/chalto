'use client';

import React, { useState } from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import { ConfidenceSelector } from './ConfidenceSelector';
import { ConfidenceLevel } from '../../models/user';

interface TreasuryInputProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function TreasuryInput({ data, onUpdate, onNext }: TreasuryInputProps) {
  const [value, setValue] = useState(data.treasuryCurrentCents / 100 || 0);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(data.confidence?.treasury || 'exact');

  const shortcuts = [0, 5000, 10000, 20000];

  const handleNext = () => {
    onUpdate({ 
      treasuryCurrentCents: value * 100,
      confidence: { ...data.confidence, treasury: confidence }
    });
    onNext();
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Wallet className="w-8 h-8 text-indigo-400" />
          Votre trésorerie actuelle
        </h2>
        <p className="text-zinc-500 text-lg">
          Combien d'argent avez-vous de disponible pour votre activité ?
        </p>
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
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-semibold text-zinc-500">€</div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {shortcuts.map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              className={`px-6 py-3 rounded-full border text-sm font-semibold transition-all ${
                value === s 
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              {s.toLocaleString()}€
            </button>
          ))}
        </div>
      </div>

      <ConfidenceSelector value={confidence} onChange={setConfidence} />

      <button 
        onClick={handleNext}
        className="w-full py-5 rounded-2xl font-bold text-lg bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all"
      >
        Continuer
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
