'use client';

import React from 'react';
import { FreelancerStatus } from '@/models/fiscal';
import { Briefcase, Paintbrush, ShoppingCart, Laptop, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusCategory = 'micro_bnc' | 'bnc_reel' | 'artiste' | 'bic' | 'unknown';

interface StatusOption {
  id: StatusCategory;
  label: string;
  description: string;
  icon: React.ElementType;
}

const OPTIONS: StatusOption[] = [
  {
    id: 'micro_bnc',
    label: 'Micro-entrepreneur',
    description: 'Auto-entrepreneur (BNC ou BIC) avec abattement forfaitaire.',
    icon: Briefcase,
  },
  {
    id: 'bnc_reel', 
    label: 'Freelance (Réel / BNC)',
    description: 'Déclaration contrôlée avec déduction des frais réels.',
    icon: Laptop,
  },
  {
    id: 'artiste',
    label: 'Créatif / Artiste',
    description: 'Artiste-auteur affilié à la Sécurité Sociale des Artistes.',
    icon: Paintbrush,
  },
  {
    id: 'bic',
    label: 'Commerce / BIC',
    description: 'Achat-revente, artisanat, vente de marchandises.',
    icon: ShoppingCart,
  },
];

interface StatusPickerProps {
  selected: StatusCategory | undefined;
  onSelect: (status: StatusCategory) => void;
}

export function StatusPicker({ selected, onSelect }: StatusPickerProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">
        Tu es plutôt...
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative group flex flex-col items-start p-6 rounded-[2rem] border transition-all duration-300 text-left",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected 
                  ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.1)]" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                isSelected ? "bg-indigo-500 text-white" : "bg-white/5 text-zinc-400 group-hover:bg-white/10"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className={cn(
                "font-bold text-lg mb-1 transition-colors",
                isSelected ? "text-white" : "text-zinc-300"
              )}>
                {option.label}
              </h3>
              
              <p className="text-sm text-zinc-500 leading-relaxed">
                {option.description}
              </p>

              {isSelected && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
