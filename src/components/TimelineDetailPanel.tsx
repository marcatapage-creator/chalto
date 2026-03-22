'use client';

import React from 'react';
import { X, Info, HelpCircle, AlertCircle, Calendar, Calculator, Landmark } from 'lucide-react';
import { TimelineEntry } from '../models/simulation';

interface TimelineDetailPanelProps {
  entry: TimelineEntry | null;
  onClose: () => void;
}

export function TimelineDetailPanel({ entry, onClose }: TimelineDetailPanelProps) {
  if (!entry) return null;

  const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.abs(amountCents) / 100);
  };

  const getExplanation = (label: string) => {
    if (label.includes('URSSAF')) {
      return {
        why: "Cotisations sociales obligatoires pour votre protection (retraite, santé, famille).",
        base: "Calculé sur votre Chiffre d'Affaires HT (Micro) ou votre Bénéfice Net (Réel).",
        how: "Basé sur les taux 2026. En Micro-BNC, c'est environ 21.1% à 23.2% selon votre option.",
        anticipate: "Mettez de côté dès l'encaissement de chaque facture pour éviter les sorties de cash brutales."
      };
    }
    if (label.includes('TVA')) {
      return {
        why: "Impôt indirect collecté pour le compte de l'État.",
        base: "La différence entre la TVA collectée sur vos ventes et la TVA déductible sur vos achats.",
        how: "Taux normal à 20% ou réduit à 10%/5.5%.",
        anticipate: "Le montant de la TVA n'est pas votre argent. Ne l'utilisez jamais pour vos dépenses personnelles."
      };
    }
    if (label.includes('Impôt')) {
      return {
        why: "Contribution aux charges publiques basée sur vos revenus annuels.",
        base: "Votre revenu net imposable après abattement ou frais réels.",
        how: "Barème progressif par tranches (0%, 11%, 30%, 41%, 45%).",
        anticipate: "Plus votre CA augmente, plus votre tranche marginale peut monter. Chalto simule ce saut de tranche."
      };
    }
    return {
      why: "Événement financier prévu dans votre calendrier.",
      base: "Basé sur vos prévisions et votre historique.",
      how: "Calcul automatique du moteur Chalto.",
      anticipate: "Suivez votre indicateur Safe-to-Spend pour savoir si cet événement est déjà couvert."
    };
  };

  const explanation = getExplanation(entry.label);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-[100] animate-in slide-in-from-right duration-500 flex flex-col">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Détails de l'événement</h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Pédagogie Fiscale</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        {/* Header Summary */}
        <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">{entry.label}</div>
          <div className="text-4xl font-bold mb-4">{formatCurrency(entry.amountCents)}</div>
          <div className="flex items-center gap-2 text-xs font-medium opacity-80">
            <Calendar className="w-4 h-4" />
            Échéance prévue : {entry.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-lg bg-white/5 text-zinc-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-300 mb-1">Pourquoi cet événement ?</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">{explanation.why}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-lg bg-white/5 text-zinc-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-300 mb-1">Quelle base de calcul ?</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">{explanation.base}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-lg bg-white/5 text-zinc-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-300 mb-1">Comment est-ce calculé ?</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">{explanation.how}</p>
            </div>
          </div>
        </section>

        {/* Anticipation Card */}
        <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <AlertCircle className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest">Conseil d'Anticipation</h4>
          </div>
          <p className="text-sm text-emerald-100/60 leading-relaxed italic">
            "{explanation.anticipate}"
          </p>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 bg-white/[0.01]">
        <button 
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}
