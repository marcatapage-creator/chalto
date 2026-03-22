'use client';

import React from 'react';
import { UserProfile } from '@/models/user';
import { Ruleset } from '@/models/ruleset';
import ruleset2026 from '@/rulesets/ruleset_2026.json';
import { FiscalContextBuilder } from '@/core/context/fiscal-context-builder';
import { FiscalCalculationEngine } from '@/core/fiscal/fiscal-engine';
import { Zap, ShieldCheck } from 'lucide-react';

interface OnboardingPreviewProps {
  data: Partial<UserProfile>;
}

export function OnboardingPreview({ data }: OnboardingPreviewProps) {
  // Only show results if we have the critical 3: status, revenue, and family
  const annualRevenueCents = data.estimatedAnnualRevenueCents || data.revenueLastYearCents || 0;
  const isReady = data.fiscalStatus && annualRevenueCents > 0 && data.taxHouseholdParts !== undefined;

  if (!isReady) return null;

  // Build temporary context for calculation
  const tempUser: UserProfile = {
    ...data,
    personalMonthlyExpensesCents: data.personalMonthlyExpensesCents ?? 0,
    treasuryCurrentCents: data.treasuryCurrentCents ?? 0,
    revenueYTDCents: data.revenueYTDCents ?? 0,
    monthsElapsed: data.monthsElapsed ?? 0,
    hasACRE: data.hasACRE ?? false,
    hasVersementLiberatoire: data.hasVersementLiberatoire ?? false,
    safetyMode: 'conservative',
    safetyMarginBps: 9000,
    confidence: { revenue: 'estimated', expenses: 'estimated', treasury: 'exact' }
  } as UserProfile;

  const context = FiscalContextBuilder.build(tempUser, ruleset2026 as unknown as Ruleset);
  const result = FiscalCalculationEngine.execute(annualRevenueCents, context);

  // Calculate monthly safe-to-spend
  const totalAnnualCharges = result.socialChargesAnnual + result.retirementChargesAnnual + result.incomeTaxEstimateAnnual;
  const netAnnual = annualRevenueCents - totalAnnualCharges;
  const monthlySts = Math.round((netAnnual / 12) * 0.9 / 100);

  return (
    <div className="mt-12 p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Aperçu Immédiat
        </span>
      </div>

      <div className="space-y-1 mb-8">
        <p className="text-sm text-zinc-500 font-medium">Safe-to-Spend estimé</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white tracking-tight">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlySts)}
          </span>
          <span className="text-zinc-500 font-bold">/ mois</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Estimation initiale — ~60% de précision
          </span>
        </div>
        <p className="text-xs text-zinc-500 italic">
          Complète l'étape suivante pour affiner ce résultat.
        </p>
      </div>
    </div>
  );
}
