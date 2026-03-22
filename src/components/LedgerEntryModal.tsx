'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Euro, Tag, ArrowUpRight, ArrowDownLeft, CheckCircle2, Zap } from 'lucide-react';
import { LedgerEntry, LedgerEntryType } from '../models/context';
import { UserProfile } from '../models/user';

interface LedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<LedgerEntry, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<LedgerEntry>) => void;
  onDelete?: (id: string) => void;
  entry?: LedgerEntry;
  initialType?: LedgerEntryType;
  initialAmount?: string;
}

export function LedgerEntryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onUpdate, 
  onDelete,
  entry,
  initialType = 'revenue',
  initialAmount = ''
}: LedgerEntryModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<LedgerEntryType>(initialType);
  const [isTtc, setIsTtc] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('chalto_user_profile');
    if (savedUser) setUser(JSON.parse(savedUser));

    if (entry) {
      setCategory(entry.category);
      setAmount((entry.amountCents / 100).toString());
      setDate(new Date(entry.effectiveDate).toISOString().split('T')[0]);
      setType(entry.type);
      setIsTtc(entry.isTtc || false);
    } else {
      setCategory('');
      setAmount(initialAmount);
      setDate(new Date().toISOString().split('T')[0]);
      setType(initialType);
      setIsTtc(false);
    }
    setIsSuccess(false);
  }, [entry, isOpen, initialType, initialAmount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(amount);
    const amountCents = Math.round(rawAmount * 100);
    if (isNaN(amountCents) || category.trim() === '') return;

    let vatCents = 0;
    if (isTtc) {
      // 20% VAT extraction: HT = TTC / 1.2 => VAT = TTC - HT
      const ht = rawAmount / 1.2;
      vatCents = Math.round((rawAmount - ht) * 100);
    }

    const data: Omit<LedgerEntry, 'id'> = {
      category: category.trim(),
      amountCents,
      effectiveDate: new Date(date),
      type,
      source: 'manual',
      origin: 'user',
      status: 'realized',
      monthKey: date.substring(0, 7),
      isForecast: false,
      immutable: false,
      isTtc,
      vatCents
    };

    if (entry && onUpdate) {
      onUpdate(entry.id, data);
    } else {
      onSave(data);
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const amountNumber = parseFloat(amount) || 0;
  const htAmount = isTtc ? amountNumber / 1.2 : amountNumber;
  const vatAmount = amountNumber - htAmount;
  
  // Detailed impact calculation (Impact Engine)
  const getImpact = () => {
    if (!user || amountNumber <= 0) return null;
    
    // Mocking fiscal rates for preview (should come from core engine ideally)
    let socialRate = 0.22; 
    let irRate = 0.10;
    if (user.fiscalStatus === 'micro') socialRate = 0.22;
    if (user.fiscalStatus === 'bnc') socialRate = 0.45;
    if (user.fiscalStatus === 'artiste') socialRate = 0.16;

    if (type === 'business_expense') {
      return {
        cashImpact: -amountNumber,
        fiscalImpact: 0,
        liabilityImpact: 0,
        text: `-${amountNumber}€ de trésorerie`,
        subtext: isTtc ? `Dont ${vatAmount.toFixed(2)}€ de TVA.` : "Impact direct sur votre matelas de sécurité.",
        color: "text-rose-400"
      };
    }
    
    const socialProvision = Math.round(htAmount * socialRate);
    const irProvision = Math.round(htAmount * irRate);
    const safeToSpend = htAmount - socialProvision - irProvision;

    return {
      cashImpact: amountNumber,
      fiscalImpact: irProvision,
      liabilityImpact: socialProvision,
      text: `+${safeToSpend.toFixed(2)}€ de Safe-to-Spend`,
      subtext: isTtc 
        ? `Basé sur ${htAmount.toFixed(2)}€ HT. Provision : ${socialProvision}€ (Social) + ${irProvision}€ (Impôt).`
        : `Provision : ${socialProvision}€ (Social) + ${irProvision}€ (Impôt).`,
      color: "text-emerald-400"
    };
  };

  const impact = getImpact();

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] p-12 text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Réalité synchronisée</h2>
          <p className="text-[var(--text-secondary)] text-sm">Vos projections et votre sécurité financière ont été mises à jour.</p>
          {impact && (
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <p className={`text-sm font-bold ${impact.color}`}>{impact.text}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-6 
      transition-opacity duration-500
      ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
    `}>
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className={`
        relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden 
        transition-all duration-500 transform
        ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-20 scale-95'}
      `}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)]">
              {entry ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setType('revenue')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  type === 'revenue' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Revenu</span>
              </button>
              <button
                type="button"
                onClick={() => setType('business_expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  type === 'business_expense' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Dépense</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Libellé (ex: Facture #2026-04)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 focus:bg-[var(--surface-hover)] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group flex flex-col gap-2">
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Montant"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 focus:bg-[var(--surface-hover)] transition-all"
                      required
                    />
                  </div>
                  
                  {/* HT/TTC Switch */}
                  <div className="flex p-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] self-start">
                    <button
                      type="button"
                      onClick={() => setIsTtc(false)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!isTtc ? 'bg-[var(--surface-hover)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    >
                      HT
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTtc(true)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${isTtc ? 'bg-indigo-500/20 text-indigo-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                    >
                      TTC
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 focus:bg-[var(--surface-hover)] transition-all [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Impact Engine Preview */}
            {impact && (
              <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 animate-in slide-in-from-top-2 duration-500 transition-colors">
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Impact Engine</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className={`text-sm font-bold ${impact.color}`}>{impact.text}</p>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed uppercase tracking-wider">Disponibilité</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-400">+{impact.liabilityImpact + impact.fiscalImpact}€</p>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed uppercase tracking-wider">Charge future</p>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] italic leading-relaxed">{impact.subtext}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {entry && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Supprimer cet événement ?')) {
                      onDelete(entry.id);
                      onClose();
                    }
                  }}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
              >
                <Save className="w-5 h-5" />
                {entry ? 'Enregistrer les modifications' : 'Synchroniser la réalité'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
