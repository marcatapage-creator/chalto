'use client';

import React, { useState, useMemo } from 'react';
import { UserProfile, USER_PROFILE_DEFAULTS } from '../../models/user';
import { StatusPicker, StatusCategory } from '@/components/onboarding/StatusPicker';
import { FamilyInput } from '@/components/onboarding/FamilyInput';
import { ActivityTypePicker } from '@/components/onboarding/ActivityTypePicker';
import { OnboardingPreview } from '@/components/onboarding/OnboardingPreview';
import { ChevronLeft, ArrowRight, SkipForward, HelpCircle } from 'lucide-react';
import { LedgerService } from '@/core/ledger/ledger-service';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

const HelpTooltip: React.FC<{ content: string }> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-2 group">
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-zinc-600 hover:text-indigo-400 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[11px] leading-relaxed text-zinc-300 font-medium">
            {content}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-zinc-900" />
        </div>
      )}
    </div>
  );
};

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [revenueMode, setRevenueMode] = useState<'estimate' | 'last_year'>('estimate');
  const [data, setData] = useState<Partial<UserProfile>>({
    ...USER_PROFILE_DEFAULTS,
    fiscalStatus: undefined,
    estimatedAnnualRevenueCents: 0,
    revenueLastYearCents: 0,
    taxHouseholdParts: 1,
  });

  const updateData = (newData: Partial<UserProfile>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleStatusSelect = (category: StatusCategory) => {
    let fiscalStatus = 'micro' as any;
    
    // Default activity types based on status, but will be refined in Step 2
    let activityType = 'services' as any;

    if (category === 'artiste') {
      fiscalStatus = 'artiste';
      activityType = 'liberal';
    }
    if (category === 'bic') {
      fiscalStatus = 'micro';
      activityType = 'sales';
    }
    if (category === 'bnc_reel') {
      fiscalStatus = 'bnc';
      activityType = 'liberal';
    }
    if (category === 'micro_bnc') {
      fiscalStatus = 'micro';
      activityType = 'services';
    }

    updateData({ fiscalStatus, activityType });
  };

  const handleFamilyUpdate = React.useCallback((sit: 'seul' | 'couple', child: number, parts: number) => {
    updateData({ 
      taxHouseholdParts: parts, 
      isMarried: sit === 'couple', 
      numberOfChildren: child 
    });
  }, []);

  const isScreen1Valid = data.fiscalStatus && 
    ((revenueMode === 'estimate' && data.estimatedAnnualRevenueCents && data.estimatedAnnualRevenueCents > 0) || 
     (revenueMode === 'last_year' && data.revenueLastYearCents && data.revenueLastYearCents > 0)) && 
    data.taxHouseholdParts;

  const renderScreen1 = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <StatusPicker 
        selected={data.fiscalStatus as any} 
        onSelect={handleStatusSelect} 
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            {revenueMode === 'estimate' ? 'Ton C.A. estimé (annuel HT)' : 'Ton C.A. N-1 (annuel HT)'}
          </p>
          <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
            <button 
              onClick={() => setRevenueMode('estimate')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                revenueMode === 'estimate' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              N (Estimé)
            </button>
            <button 
              onClick={() => setRevenueMode('last_year')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                revenueMode === 'last_year' ? "bg-white text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              N-1
            </button>
          </div>
        </div>
        
        <div className="relative group">
          <input 
            type="number"
            value={revenueMode === 'estimate' 
              ? (data.estimatedAnnualRevenueCents || 0) / 100 || '' 
              : (data.revenueLastYearCents || 0) / 100 || ''
            }
            onChange={(e) => {
              const val = Number(e.target.value) * 100;
              if (revenueMode === 'estimate') {
                updateData({ estimatedAnnualRevenueCents: val });
              } else {
                updateData({ revenueLastYearCents: val });
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-4xl font-black text-white outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all"
            placeholder="0"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-600">€</div>
        </div>
        {revenueMode === 'last_year' && (
          <p className="text-[10px] text-zinc-500 font-medium px-4">
            Utilisé comme base de calcul si tes revenus N sont incertains.
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Ton matelas actuel (Trésorerie)
          </p>
          <HelpTooltip content="L'argent que tu as déjà de côté spécifiquement pour ton activité professionnelle." />
        </div>
        <div className="relative group">
          <input 
            type="number"
            value={(data.treasuryCurrentCents || 0) / 100 || ''}
            onChange={(e) => updateData({ treasuryCurrentCents: Number(e.target.value) * 100 })}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-2xl font-black text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
            placeholder="0"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-600">€</div>
        </div>
      </div>

      <FamilyInput 
        onUpdate={handleFamilyUpdate} 
      />

      <OnboardingPreview data={data} />

      <button
        onClick={() => setStep(2)}
        disabled={!isScreen1Valid}
        className={cn(
          "w-full py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3",
          isScreen1Valid 
            ? "bg-white text-black hover:bg-zinc-200 shadow-[0_20px_40px_rgba(255,255,255,0.1)]" 
            : "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5"
        )}
      >
        Continuer
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );

  const renderScreen2 = () => (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Précision croissante</h2>
        <p className="text-zinc-500 font-medium">Quelques réglages pour affiner ton moteur fiscal.</p>
      </div>

      <div className="space-y-10">
        <ActivityTypePicker 
          selected={data.activityType}
          onSelect={(type) => updateData({ activityType: type })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(data.fiscalStatus === 'micro' || data.fiscalStatus === 'bnc' || data.fiscalStatus === 'artiste' || data.fiscalStatus === undefined) && (
            <div className="space-y-4">
              <div className="flex items-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Bénéficies-tu de l'ACRE ?</p>
                <HelpTooltip content="L'ACRE réduit de moitié tes cotisations sociales pendant ta première année." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => updateData({ hasACRE: val })}
                    className={cn(
                      "py-4 rounded-2xl border font-bold transition-all",
                      data.hasACRE === val ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-zinc-500"
                    )}
                  >
                    {val ? 'Oui' : 'Non'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(data.fiscalStatus === 'bnc' || data.fiscalStatus === 'micro' || data.fiscalStatus === undefined) && (
            <div className="space-y-4">
              <div className="flex items-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Régime de TVA ?</p>
                <HelpTooltip content="En franchise de TVA, tu ne factures pas de TVA et n'en déduis pas. Assujetti, tu la gères." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Franchise', value: 'exempted' },
                  { label: 'Assujetti', value: 'normal' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateData({ vatStatus: opt.value === 'normal' } as any)}
                    className={cn(
                      "py-4 rounded-2xl border font-bold transition-all",
                      (data as any).vatStatus === (opt.value === 'normal') ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-zinc-500"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.fiscalStatus === 'micro' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Versement libératoire ?</p>
              <HelpTooltip content="Paiement de l'impôt sur le revenu directement sur chaque facture." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => updateData({ hasVersementLiberatoire: val })}
                  className={cn(
                    "py-4 rounded-2xl border font-bold transition-all",
                    data.hasVersementLiberatoire === val ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-zinc-500"
                  )}
                >
                  {val ? 'Oui' : 'Non'}
                </button>
              ))}
            </div>
          </div>
        )}

        {data.fiscalStatus === 'bnc' && (
          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
             <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Déclaration Contrôlée</p>
                <p className="text-xs text-indigo-200/60 leading-relaxed font-medium">
                  Régime fiscal des freelances déduisant leurs vraies dépenses professionnelles. Obligatoire au-delà de 77 700 € de CA.
                </p>
             </div>
          </div>
        )}
      </div>

      <OnboardingPreview data={data} />

      <div className="flex flex-col gap-4">
        <button
          onClick={() => {
            const finalData = {
              ...data,
              incomeEstimationMethod: revenueMode === 'estimate' ? 'estimate' : 'last_year',
              estimatedAnnualRevenueCents: data.estimatedAnnualRevenueCents || 0,
              revenueLastYearCents: data.revenueLastYearCents || 0
            } as any;
            
            // 1. Save profile
            const profileKey = auth.getStorageKey('chalto_user_profile');
            localStorage.setItem(profileKey, JSON.stringify(finalData));
            
            // 2. Seed Ledger
            const seeded = LedgerService.initialize(finalData, []);
            const ledgerKey = auth.getStorageKey('chalto_ledger_entries');
            localStorage.setItem(ledgerKey, JSON.stringify(seeded));
            
            router.push('/dashboard');
          }}
          className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xl uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
        >
          Accéder au Dashboard
        </button>
        <button
          onClick={() => {
            const finalData = {
              ...data,
              incomeEstimationMethod: revenueMode === 'estimate' ? 'estimate' : 'last_year'
            } as any;
            
            const profileKey = auth.getStorageKey('chalto_user_profile');
            localStorage.setItem(profileKey, JSON.stringify(finalData));
            
            const seeded = LedgerService.initialize(finalData, []);
            const ledgerKey = auth.getStorageKey('chalto_ledger_entries');
            localStorage.setItem(ledgerKey, JSON.stringify(seeded));
            
            router.push('/dashboard');
          }}
          className="flex items-center justify-center gap-2 text-zinc-500 hover:text-white font-bold transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          Passer cette étape
        </button>
      </div>

      <button 
        onClick={() => setStep(1)}
        className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour
      </button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-6 py-20 min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        {step === 1 ? renderScreen1() : renderScreen2()}
      </div>
      
      <footer className="mt-20 pt-12 border-t border-white/5 text-center text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">
        Chalto // L'un d'entre nous
      </footer>
    </div>
  );
}
