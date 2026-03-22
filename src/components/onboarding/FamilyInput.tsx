'use client';

import React, { useState, useEffect } from 'react';
import { Users, User, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyInputProps {
  initialSituation?: 'seul' | 'couple';
  initialChildren?: number;
  onUpdate: (situation: 'seul' | 'couple', children: number, parts: number) => void;
}

export function FamilyInput({ initialSituation, initialChildren = 0, onUpdate }: FamilyInputProps) {
  const [situation, setSituation] = useState<'seul' | 'couple' | undefined>(initialSituation);
  const [children, setChildren] = useState<number>(initialChildren);

  const calculateParts = (sit: 'seul' | 'couple', count: number): number => {
    if (sit === 'couple') {
      if (count === 0) return 2;
      if (count === 1) return 2.5;
      if (count === 2) return 3;
      return 3.5; // 3+ children
    } else {
      if (count === 0) return 1;
      if (count === 1) return 1.5;
      return 2; // 2+ children for single parents
    }
  };

  useEffect(() => {
    if (situation !== undefined) {
      onUpdate(situation, children, calculateParts(situation, children));
    }
  }, [situation, children, onUpdate]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          Ta situation
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSituation('seul')}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300",
              situation === 'seul' 
                ? "bg-indigo-500/10 border-indigo-500 text-white" 
                : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
            )}
          >
            <User className="w-6 h-6 mb-2" />
            <span className="font-bold">Seul</span>
          </button>
          <button
            onClick={() => setSituation('couple')}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300",
              situation === 'couple' 
                ? "bg-indigo-500/10 border-indigo-500 text-white" 
                : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
            )}
          >
            <Users className="w-6 h-6 mb-2" />
            <span className="font-bold">En couple</span>
          </button>
        </div>
      </div>

      <div className={cn(
        "space-y-4 transition-all duration-500",
        situation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          Enfants à charge
        </p>
        <div className="flex flex-wrap gap-3">
          {[0, 1, 2, '3+'].map((count) => {
            const val = typeof count === 'string' ? 3 : count;
            const isSelected = children === val || (count === '3+' && children >= 3);
            
            return (
              <button
                key={count}
                onClick={() => setChildren(val)}
                className={cn(
                  "min-w-[64px] h-12 rounded-2xl border flex items-center justify-center font-bold transition-all duration-300",
                  isSelected
                    ? "bg-indigo-500/10 border-indigo-500 text-white"
                    : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                )}
              >
                {count === 0 ? 'Aucun' : count}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
