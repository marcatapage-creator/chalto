'use client';

import React from 'react';
import { FreelancerStatus } from '../../models/fiscal';
import { Briefcase, Paintbrush, FileText } from 'lucide-react';

interface ProfileStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function ProfileStep({ data, onUpdate, onNext }: ProfileStepProps) {
  const options = [
    { id: 'micro' as FreelancerStatus, label: 'Auto-entrepreneur', desc: 'Régime Micro-BNC / Micro-BIC', icon: Briefcase },
    { id: 'bnc' as FreelancerStatus, label: 'Indépendant (BNC)', desc: 'Régime Réel ou Déclaration contrôlée', icon: FileText },
    { id: 'artiste' as FreelancerStatus, label: 'Artiste-Auteur', desc: 'Régime Spécial Artiste (IRCEC, etc.)', icon: Paintbrush },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Parlons de votre activité</h2>
        <p className="text-zinc-500">Choisissez votre statut fiscal pour une estimation précise des charges.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              onUpdate({ fiscalStatus: opt.id });
              onNext();
            }}
            className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 text-left ${
              data.fiscalStatus === opt.id 
                ? 'bg-indigo-500/10 border-indigo-500/50 text-white' 
                : 'bg-white/2 border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10'
            }`}
          >
            <div className={`p-2 rounded-lg ${data.fiscalStatus === opt.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-zinc-500'}`}>
              <opt.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">{opt.label}</div>
              <div className="text-xs text-zinc-500 mt-1">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
