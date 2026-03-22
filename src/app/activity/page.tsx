'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity as ActivityIcon, TrendingUp, TrendingDown, Landmark, Plus, Loader2, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLedger } from '@/core/ledger/ledger-hook';
import { LedgerEntryModal } from '@/components/LedgerEntryModal';
import { LedgerEntry } from '@/models/context';
import { UserProfile } from '@/models/user';

import { auth } from '@/lib/auth';

export default function ActivityPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const savedUser = localStorage.getItem(key);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/onboarding');
    }
    setLoading(false);
  }, [router]);

  const { 
    entries, 
    isLoaded, 
    addEntry,
    updateEntry,
    deleteEntry,
    getYearToDateCashFlow, 
    getMonthlyStats 
  } = useLedger();
  
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedEntry(undefined);
    setIsModalOpen(true);
  };

  if (loading || !isLoaded || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amountCents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date);
  };

  const currentMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(currentMonth.getMonth() - 1);

  const currentStats = getMonthlyStats(currentMonth);
  const lastMonthStats = getMonthlyStats(lastMonth);
  const ytdStats = getYearToDateCashFlow();

  const monthlyForecast = (user.estimatedAnnualRevenueCents || 0) / 12;
  const deltaMonthly = currentStats.totalInflowHT - monthlyForecast;
  const trend = lastMonthStats.totalInflowHT > 0 
    ? ((currentStats.totalInflowHT - lastMonthStats.totalInflowHT) / lastMonthStats.totalInflowHT) * 100
    : 0;

  // Impact estimation: assuming ~75% net for simplified impact
  const safeToSpendImpact = deltaMonthly * 0.75;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 pb-40">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <ActivityIcon className="w-6 h-6 text-indigo-400" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Flux Réel
            </h1>
          </div>
          <p className="text-zinc-500 text-sm italic">
            "Réalité vs Prévisions : Qu'est-ce qui a changé ?"
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-24 h-24 text-indigo-400" />
            </div>
            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold">Moteur de Vérité</h3>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${deltaMonthly > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {deltaMonthly > 0 ? 'Surperformance' : 'Vigilance'}
                </span>
              </div>
              <div className="text-4xl font-bold text-white mb-2 tabular-nums">
                {deltaMonthly > 0 ? '+' : ''}{formatCurrency(deltaMonthly)}
                <span className="text-sm font-medium text-zinc-600 ml-2">vs prévision</span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Impact Safe-to-spend</span>
                  <span className={`font-bold ${deltaMonthly > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {deltaMonthly > 0 ? '+' : ''}{formatCurrency(safeToSpendImpact)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Ajustement URSSAF</span>
                  <span className="text-zinc-300 font-medium">Auto-ajusté</span>
                </div>
                <Link 
                  href="/hypotheses"
                  className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors pt-4 border-t border-white/5"
                >
                  Comprendre le calcul
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] transition-all hover:bg-white/[0.04] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Trésorerie Réelle</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  Source: Ledger
                </span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-white">{formatCurrency(ytdStats.totalInflow)}</span>
                <span className="text-[10px] text-zinc-600 mb-1 font-bold italic">TTC / ENCAISSÉ</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-4">
              Ce montant est la base de calcul de votre "Safe Mode". Chaque euro ici est un euro sécurisé.
            </p>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">Réconciliation</h2>
            <div className="flex gap-4">
              <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white hover:bg-white/10 transition-all"
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
              <button className="text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                Filtrer les flux
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
                <p className="text-zinc-600 text-sm">Aucun événement pour le moment.</p>
              </div>
            ) : (
              entries.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleEdit(item)}
                  className="group flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${
                      item.type === 'revenue' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {item.type === 'revenue' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-200">{item.category}</div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wider">{formatDate(item.effectiveDate)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${item.type === 'revenue' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.type === 'revenue' ? '+' : '-'} {formatCurrency(item.amountCents)}
                    </div>
                    <div className="text-[10px] text-zinc-700 uppercase tracking-widest">
                      {item.type === 'revenue' ? 'Revenu' : 'Charge'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <LedgerEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={selectedEntry}
        onSave={addEntry}
        onUpdate={updateEntry}
        onDelete={deleteEntry}
      />
    </div>
  );
}
