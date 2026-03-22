'use client';

import React from 'react';
import { ActivityType } from '@/models/user';
import { Stethoscope, Laptop, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTypeOption {
  id: ActivityType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const OPTIONS: ActivityTypeOption[] = [
  {
    id: 'liberal',
    label: 'Libéral',
    description: 'Professions intellectuelles, santé, conseil, juridique.',
    icon: Stethoscope,
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Prestations de services commerciales ou artisanales.',
    icon: Laptop,
  },
  {
    id: 'sales',
    label: 'Vente',
    description: 'Achat-revente, restauration, hôtellerie.',
    icon: ShoppingBag,
  },
];

interface ActivityTypePickerProps {
  selected: ActivityType | undefined;
  onSelect: (type: ActivityType) => void;
}

export function ActivityTypePicker({ selected, onSelect }: ActivityTypePickerProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">
        Type d'activité
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative group flex flex-col items-center p-6 rounded-[2rem] border transition-all duration-300 text-center",
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
                <Icon className="w-5 h-5" />
              </div>
              
              <h3 className={cn(
                "font-bold text-sm mb-1 transition-colors",
                isSelected ? "text-white" : "text-zinc-300"
              )}>
                {option.label}
              </h3>
              
              <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">
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
