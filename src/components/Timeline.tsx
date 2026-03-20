import React from 'react';
import { TimelineEntry } from '../models/simulation';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

interface TimelineProps {
  entries: TimelineEntry[];
}

export const Timeline: React.FC<TimelineProps> = ({ entries }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">Axes Fiscal & Projection</h3>
      
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
        {entries.filter(e => e.type !== 'initial').map((entry, idx) => {
          const isPositive = entry.amountCents > 0;
          const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(Math.abs(entry.amountCents) / 100);

          return (
            <div key={idx} className="relative flex items-center gap-6 group">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 shadow-xl transition-all group-hover:scale-110 ${isPositive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              
              <div className="flex flex-1 items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 backdrop-blur-sm transition-all hover:bg-white/[0.04]">
                <div>
                  <div className="text-sm font-medium text-zinc-100">{entry.label}</div>
                  <div className="text-xs text-zinc-500">
                    {entry.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : '-'}{formattedAmount}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                    Solde: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.balanceCents / 100)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
