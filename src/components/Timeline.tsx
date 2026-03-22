import React from 'react';
import Link from 'next/link';
import { TimelineEntry } from '../models/simulation';
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

interface TimelineProps {
  entries: TimelineEntry[];
  onSelectEntry?: (entry: TimelineEntry) => void;
  onAdjust?: (entry: TimelineEntry) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ entries, onSelectEntry, onAdjust }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 transition-colors duration-300">Axes Fiscal & Projection</h3>
      
      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
        {entries.filter(e => e.type !== 'initial').map((entry, idx) => {
          const isPositive = entry.amountCents > 0;
          const isNegative = entry.amountCents < 0;
          
          // Coverage logic:
          // Covered if balance stays above safe threshold (e.g. 0)
          // Partially if balance was positive but went negative
          // Not covered if balance was already negative
          const prevBalance = idx > 0 ? entries[idx].balanceCents : entries[0].balanceCents;
          const isCovered = entry.balanceCents >= 0;
          const isPartiallyCovered = !isCovered && prevBalance > 0;
          
          const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(Math.abs(entry.amountCents) / 100);
 
          return (
            <div key={idx} className="relative flex items-center gap-6 group">
              <div className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xl transition-all group-hover:scale-110
                ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                  isCovered ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                  isPartiallyCovered ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'}
              `}>
                {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
              </div>
              
              <button 
                onClick={() => onSelectEntry?.(entry)}
                className="flex flex-1 flex-col rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-sm transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--border)] group-hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] text-left"
              >
                {/* LINE 1: Meta (Date + Badge) */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">
                    {entry.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </div>
                  {isNegative && (
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg border font-bold ${
                        isCovered ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        isPartiallyCovered ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {isCovered ? 'Couvert' : isPartiallyCovered ? 'Partiel' : 'Risque'}
                      </span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjust?.(entry);
                        }}
                        className="text-[8px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer border-b border-indigo-400/30"
                      >
                        Ajuster
                      </span>
                    </div>
                  )}
                </div>
 
                {/* LINE 2: Core (Name + Amount) */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-base font-bold text-[var(--text-primary)] tracking-tight">{entry.label}</div>
                  <div className={`text-base font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                    {isPositive ? '+' : '-'}{formattedAmount}
                  </div>
                </div>
                
                {/* LINE 3: State (Solde) */}
                <div className="flex justify-end">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                    Solde: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.balanceCents / 100)}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
