'use client';

import React from 'react';
import { ConfidenceLevel } from '../../models/user';
import { HelpCircle } from 'lucide-react';

interface ConfidenceSelectorProps {
  value: ConfidenceLevel;
  onChange: (value: ConfidenceLevel) => void;
}

export function ConfidenceSelector({ value, onChange }: ConfidenceSelectorProps) {
  const options: { id: ConfidenceLevel; label: string; desc: string }[] = [
    { id: 'estimated', label: 'Estimé', desc: 'Une approximation rapide' },
    { id: 'semi-precise', label: 'Semi-précis', desc: 'Basé sur mes derniers chiffres' },
    { id: 'exact', label: 'Exact', desc: 'Chiffre réel vérifié' },
  ];

  return (
    <div className="mt-8 pt-8 border-t border-white/5">
      <div className="flex items-center gap-2 mb-4 text-zinc-500">
        <HelpCircle className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest font-bold">Niveau de confiance</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              value === opt.id 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-white' 
                : 'bg-white/2 border-white/5 text-zinc-500 hover:bg-white/5'
            }`}
          >
            <div className={`text-xs font-bold mb-1 ${value === opt.id ? 'text-indigo-400' : ''}`}>{opt.label}</div>
            <div className="text-[10px] leading-tight opacity-60">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
