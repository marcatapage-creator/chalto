'use client';

import React from 'react';
import { Download, FileText, Table, Cloud, Lock, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExportPage() {
  const router = useRouter();

  const exportOptions = [
    {
      id: 'bilan',
      title: 'Bilan Copilote (PDF)',
      description: 'Résumé narratif de votre santé financière, vos provisions et votre safe-to-spend.',
      icon: FileText,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      tag: 'Premium'
    },
    {
      id: 'comptable',
      title: 'Export Comptable (CSV)',
      description: 'Journal des recettes simplifié, sans jargon, prêt pour votre expert-comptable.',
      icon: Table,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      tag: 'Standard'
    },
    {
      id: 'raw',
      title: 'Archive Brute (JSON)',
      description: 'L\'intégralité de vos données Ledger et de votre profil pour sauvegarde externe.',
      icon: Download,
      color: 'text-zinc-400',
      bg: 'bg-white/5',
      tag: 'Expert'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Download className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Export & Data</h1>
          </div>
          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            Vos données vous appartiennent. Exportez vos bilans en un clic pour votre usage personnel ou pour simplifier vos échanges avec votre comptable.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 mb-16">
          {exportOptions.map((opt) => (
            <div key={opt.id} className="group relative p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${opt.bg} flex items-center justify-center ${opt.color} group-hover:scale-110 transition-transform`}>
                    <opt.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{opt.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[8px] font-black uppercase tracking-widest text-zinc-500">{opt.tag}</span>
                    </div>
                    <p className="text-sm text-zinc-500 max-w-md">{opt.description}</p>
                  </div>
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
                  Générer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section: Trust & Infrastructure */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-3 mb-6 text-indigo-400">
              <Cloud className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Cloud Sync</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Données Synchronisées</div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">Dernier backup : Aujourd'hui, 14:32</div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed italic">
              Vos données sont chiffrées de bout en bout et sauvegardées en temps réel sur nos serveurs sécurisés.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 text-zinc-400">
              <Lock className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Confidentialité</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              Chalto ne vend jamais vos données financières. Nous utilisons des protocoles de sécurité de niveau bancaire (AES-256) pour garantir votre anonymat.
            </p>
            <div className="flex items-center gap-2 text-emerald-500/50 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> RGPD Compliant // SSL Secure
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
