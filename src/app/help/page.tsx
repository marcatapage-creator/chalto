'use client';

import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, ShieldCheck, ExternalLink, HelpCircle as HelpIcon, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();

  const categories = [
    { title: 'Guide d\'onboarding', icon: BookOpen, items: ['Comprendre le Safe-to-spend', 'Comment synchroniser mes revenus', 'Maîtriser la Timeline'] },
    { title: 'Foire aux Questions', icon: MessageSquare, items: ['Pourquoi mon URSSAF est élevée ?', 'Comment changer de régime ?', 'Mes données sont-elles en sécurité ?'] },
    { title: 'Support & Contact', icon: HelpIcon, items: ['Ouvrir un ticket support', 'Rejoindre la communauté Slack', 'Nous écrire un email'] },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 pb-32">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Aide & Support</h1>
          </div>
          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            Besoin d'éclaircir un chiffre ou de comprendre un mécanisme ? Notre support et notre guide interactif sont là pour vous accompagner.
          </p>
        </header>

        {/* Dynamic FAQ / Search Placeholder */}
        <section className="mb-16">
          <div className="relative p-1 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-transparent to-transparent">
            <div className="p-8 rounded-[1.9rem] bg-black/60 backdrop-blur-xl border border-white/5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">FAQ Dynamique</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all cursor-pointer group">
                  <div className="text-sm font-semibold mb-2 group-hover:text-indigo-400 transition-colors">Pourquoi mon Safe-to-spend a chuté ?</div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Analyse en temps réel de vos dernières entrées et de vos échéances fiscales.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all cursor-pointer group">
                  <div className="text-sm font-semibold mb-2 group-hover:text-indigo-400 transition-colors">Calcul de la TVA : comment ça marche ?</div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Comprendre les seuils de franchise et de base simplifiée.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {categories.map((cat, i) => (
            <div key={i} className="space-y-6">
              <div className="flex items-center gap-3">
                <cat.icon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200">{cat.title}</h3>
              </div>
              <ul className="space-y-3">
                {cat.items.map((item, j) => (
                  <li key={j} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer">
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{item}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-indigo-400 transition-all" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal & Compliance Section */}
        <section className="pt-12 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6 text-zinc-500">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Légal & Sécurité</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                  Conditions Générales d'Utilisation <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                  Politique de Confidentialité <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                  Mentions Légales <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold mb-2">Une question complexe ?</h4>
              <p className="text-xs text-zinc-600 mb-6">Contactez notre équipe de support pour un accompagnement personnalisé.</p>
              <button className="px-6 py-3 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white transition-all">
                Nous contacter
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
