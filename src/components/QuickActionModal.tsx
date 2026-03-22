'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  TrendingUp, 
  Receipt, 
  Landmark, 
  Sparkles 
} from 'lucide-react';
import { useLedger } from '@/core/ledger/ledger-hook';
import { LedgerEntryModal } from './LedgerEntryModal';
import { LedgerEntryType } from '@/models/context';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionModal({ isOpen, onClose }: QuickActionModalProps) {
  const { addEntry } = useLedger();
  const router = useRouter();
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<LedgerEntryType>('revenue');
  const [initialAmount, setInitialAmount] = useState('');

  const handleAction = (intent: string, amount: string = '') => {
    if (intent === 'forecast') {
      router.push('/onboarding');
      onClose();
      return;
    }

    // Map intents to LedgerEntryTypes
    const typeMapping: Record<string, LedgerEntryType> = {
      'revenue': 'revenue',
      'income': 'revenue',
      'expense': 'business_expense',
      'business_expense': 'business_expense',
      'personal_drawing': 'personal_drawing',
      'treasury_adjustment': 'treasury_adjustment'
    };

    const type = typeMapping[intent];
    if (type) {
      setEntryType(type);
      // Strip currency symbols and spaces from prefill amounts (e.g. "8 000 €" -> "8000")
      const cleanAmount = amount.replace(/[^0-9.]/g, '');
      setInitialAmount(cleanAmount);
      setIsEntryModalOpen(true);
    } else {
      console.log(`Intent: ${intent} not mapped.`);
      onClose();
    }
  };

  if (!isOpen && !isEntryModalOpen) return null;

  const primaryActions = [
    { title: 'J\'ai encaissé de l\'argent', icon: TrendingUp, intent: 'revenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'J\'ai dépensé', icon: Receipt, intent: 'business_expense', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Ma situation a changé', icon: Sparkles, intent: 'forecast', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];
  
  const smartPrefills = [
    { label: 'Comme en Février', amount: '8 000 €', type: 'revenue' },
    { label: 'Selon Prévision', amount: '7 500 €', type: 'revenue' },
  ];


  return (
    <>
      <div className={`
        fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6 
        transition-opacity duration-500
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />
        
        <div className={`
          relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden 
          transition-all duration-500 transform
          ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-20 scale-95'}
        `}>
          <div className="p-8 pb-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)]">
                Action Rapide
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 ml-1 font-bold">Ce qu'il se passe</h3>
                <div className="grid grid-cols-1 gap-3">
                  {primaryActions.map((action) => (
                    <button
                      key={action.title}
                      className="flex items-center gap-4 p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border)] transition-all text-left group"
                      onClick={() => handleAction(action.intent)}
                    >
                      <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">
                          {action.title}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {action.intent === 'revenue' ? 'Inscrire une nouvelle facture payée' : 
                           action.intent === 'business_expense' ? 'Déduire une dépense pro' : 
                           'Piloter le prévisionnel 2026'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 ml-1 font-bold">Suggestions intelligentes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {smartPrefills.map((prefill) => (
                    <button
                      key={prefill.label}
                      className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all group"
                      onClick={() => handleAction(prefill.type, prefill.amount)}
                    >
                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{prefill.label}</div>
                      <div className="text-lg font-bold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">{prefill.amount}</div>
                    </button>
                  ))}
                </div>
              </section>

            </div>
          </div>

          <div className="px-8 py-6 bg-[var(--surface)] border-t border-[var(--border)] text-center transition-colors">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
              Système de Décision Chalto // 2026
            </p>
          </div>
        </div>
      </div>

      <LedgerEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          onClose(); // Close the quick action modal too
        }}
        onSave={addEntry}
        initialType={entryType}
        initialAmount={initialAmount}
      />
    </>
  );
}
