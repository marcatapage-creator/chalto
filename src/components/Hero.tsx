import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { TrustReport } from '../core/engine/trust-engine';
import { cn } from '@/lib/utils';

interface HeroProps {
  amountCents: number | null;
  headline: string;
  riskLevel: 'safe' | 'warning' | 'danger';
  trustReport: TrustReport;
  anomaly?: import('../core/engine/trust-engine').Anomaly;
}

export const Hero: React.FC<HeroProps> = ({ amountCents, headline, riskLevel, trustReport, anomaly }) => {
  const isUnavailable = amountCents === null;

  const amountFormatted = !isUnavailable ? new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amountCents / 100) : "Projection indisponible";

  const colors = {
    safe: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-100',
    danger: 'bg-rose-500/10 border-rose-500/20 text-rose-100',
  };

  const Icon = riskLevel === 'safe' ? ShieldCheck : riskLevel === 'warning' ? Shield : ShieldAlert;

  return (
    <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-white/5 p-12 backdrop-blur-3xl shadow-2xl transition-all duration-500">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Icon className="w-64 h-64 -mr-20 -mt-20" />
      </div>

      <div className="relative space-y-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className={cn("px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", colors[riskLevel])}>
            <Icon className="w-3 h-3" />
            {isUnavailable ? "Attention Requise" : headline}
          </div>
          {!isUnavailable && (
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Marge de sécurité 90%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            {isUnavailable ? "Le calcul est temporairement suspendu" : "Ce que tu peux utiliser ce mois-ci"}
          </p>
          <h1 className={cn(
            "font-black text-white tracking-tighter transition-all",
            isUnavailable ? "text-4xl sm:text-5xl leading-tight" : "text-7xl sm:text-8xl"
          )}>
            {amountFormatted}
          </h1>
          {isUnavailable && anomaly && (
            <p className="text-sm text-rose-400 font-medium max-w-md">
              {anomaly.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
          {isUnavailable ? (
            <button 
              onClick={() => window.location.href = anomaly?.action === 'Aller dans Ma Réalité' ? '/real-activity' : '/settings'}
              className="px-8 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
            >
              {anomaly?.action || 'Ajuster mon profil'}
            </button>
          ) : (
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all",
              trustReport.level === 'high' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
              trustReport.level === 'medium' ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
              "bg-rose-500/20 border-rose-500/30 text-rose-400"
            )}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                trustReport.level === 'high' ? "bg-emerald-400" : 
                trustReport.level === 'medium' ? "bg-amber-400" : 
                "bg-rose-400"
              )} />
              <span className="text-sm font-black uppercase tracking-widest">
                Confiance : {trustReport.level === 'high' ? 'Élevée' : trustReport.level === 'medium' ? 'Modérée' : 'Faible'}
              </span>
            </div>
          )}
          
          <p className="text-sm text-zinc-500 font-medium italic">
            "{isUnavailable ? 'Règle ce problème pour débloquer ton Safe-to-Spend.' : riskLevel === 'safe' ? 'Ton horizon est dégagé, profite de ta liberté.' : 'Reste vigilant sur les prochaines échéances.'}"
          </p>
        </div>
      </div>
    </div>
  );
};
