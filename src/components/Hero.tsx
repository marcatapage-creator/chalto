import React from 'react';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';

interface HeroProps {
  amountCents: number;
  headline: string;
  riskLevel: 'safe' | 'warning' | 'danger';
}

export const Hero: React.FC<HeroProps> = ({ amountCents, headline, riskLevel }) => {
  const amountFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountCents / 100);

  const colors = {
    safe: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    warning: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    danger: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
  };

  const Icon = riskLevel === 'safe' ? ShieldCheck : riskLevel === 'warning' ? Info : AlertTriangle;

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-8 transition-all ${colors[riskLevel]} backdrop-blur-xl`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6" />
        <span className="text-sm font-medium uppercase tracking-wider opacity-80">{headline}</span>
      </div>
      
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium opacity-60">Montant disponible en sécurité</h2>
        <div className="text-6xl font-bold tracking-tighter sm:text-7xl">
          {amountFormatted}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm opacity-80">
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        Calculé en temps réel selon vos projections
      </div>
    </div>
  );
};
