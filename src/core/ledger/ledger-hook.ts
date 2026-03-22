'use client';

import { useState, useEffect, useCallback } from 'react';
import { LedgerEntry, LedgerEntryType } from '../../models/context';
import { MoneyCents } from '../../models/monetary';
import { UserProfile } from '../../models/user';
import { LedgerService } from './ledger-service';
import { auth } from '@/lib/auth';

const BASE_STORAGE_KEY = 'chalto_ledger_entries';

const INITIAL_MOCK_ENTRIES: LedgerEntry[] = [
  { 
    id: '1', 
    effectiveDate: new Date('2026-03-20'), 
    type: 'revenue', 
    amountCents: 450000, 
    category: 'Facture #2026-04', 
    source: 'Client A', 
    immutable: false,
    origin: 'user',
    status: 'realized',
    monthKey: '2026-03',
    isForecast: false
  },
  { 
    id: '2', 
    effectiveDate: new Date('2026-03-18'), 
    type: 'business_expense', 
    amountCents: 4500, 
    category: 'Abonnement Cloud', 
    source: 'AWS', 
    immutable: false,
    origin: 'user',
    status: 'realized',
    monthKey: '2026-03',
    isForecast: false
  },
  { 
    id: '3', 
    effectiveDate: new Date('2026-04-15'), 
    type: 'revenue', 
    amountCents: 1200000, 
    category: 'Prévision Revenu Q2', 
    source: 'Estimation', 
    immutable: false,
    origin: 'forecast',
    status: 'planned',
    monthKey: '2026-04',
    isForecast: true
  },
];

export function useLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const session = auth.getSession();
  const userId = session?.id;

  const getTargetKey = useCallback(() => {
    return auth.getStorageKey(BASE_STORAGE_KEY);
  }, []);

  useEffect(() => {
    const key = getTargetKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = parsed.map((e: any) => ({
          ...e,
          effectiveDate: new Date(e.effectiveDate)
        }));
        setEntries(hydrated);
      } catch (e) {
        console.error('Failed to parse ledger entries', e);
        setEntries([]);
      }
    } else {
      setEntries([]);
      localStorage.setItem(key, JSON.stringify([]));
    }
    setIsLoaded(true);
  }, [getTargetKey, userId]);

  const saveEntries = useCallback((newEntries: LedgerEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(getTargetKey(), JSON.stringify(newEntries));
  }, [getTargetKey]);

  const addEntry = useCallback((entry: Omit<LedgerEntry, 'id'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 11),
    };
    const updated = [newEntry, ...entries];
    saveEntries(updated);
    return newEntry;
  }, [entries, saveEntries]);

  const confirmAsReal = useCallback((id: string) => {
    const updated = entries.map(e => 
      e.id === id ? { ...e, status: 'realized' as const, origin: 'user' as const, isForecast: false } : e
    );
    saveEntries(updated);
  }, [entries, saveEntries]);

  const cancelForecast = useCallback((id: string) => {
    const updated = entries.map(e => 
      e.id === id ? { ...e, status: 'cancelled' as const } : e
    );
    saveEntries(updated);
  }, [entries, saveEntries]);

  const editAndConfirm = useCallback((id: string, amount: MoneyCents, date?: Date) => {
    const updated = entries.map(e => 
      e.id === id ? { 
        ...e, 
        amountCents: amount, 
        effectiveDate: date || e.effectiveDate, 
        status: 'realized' as const, 
        origin: 'user' as const, 
        isForecast: false 
      } : e
    );
    saveEntries(updated);
  }, [entries, saveEntries]);

  const splitForecast = useCallback((id: string, realEntries: Omit<LedgerEntry, 'id' | 'sourceForecastId' | 'status' | 'origin' | 'isForecast'>[]) => {
    const forecast = entries.find(e => e.id === id);
    if (!forecast) return;

    const filtered = entries.filter(e => e.id !== id);
    const cancelledForecast = { ...forecast, status: 'cancelled' as const };
    
    const newRealEntries = realEntries.map((re, index) => ({
      ...re,
      id: `${id}_split_${index}_${Date.now()}`,
      sourceForecastId: id,
      status: 'realized' as const,
      origin: 'user' as const,
      isForecast: false,
      monthKey: forecast.monthKey,
      immutable: false
    }));

    saveEntries([...filtered, cancelledForecast, ...newRealEntries]);
  }, [entries, saveEntries]);

  const updateEntry = useCallback((id: string, updates: Partial<LedgerEntry>) => {
    const updated = entries.map(e => e.id === id ? { ...e, ...updates } : e);
    saveEntries(updated);
  }, [entries, saveEntries]);

  const deleteEntry = useCallback((id: string) => {
    const updated = entries.filter(e => e.id !== id);
    saveEntries(updated);
  }, [entries, saveEntries]);

  const seedFromProfile = useCallback((profile: UserProfile) => {
    const seeded = LedgerService.initialize(profile, []);
    saveEntries(seeded);
  }, [saveEntries]);

  const getYearToDateCashFlow = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const ytdEntries = entries.filter(e => e.effectiveDate.getFullYear() === currentYear);
    
    const totalInflow = ytdEntries
      .filter(e => e.type === 'revenue' && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amountCents, 0);

    const totalInflowHT = ytdEntries
      .filter(e => e.type === 'revenue' && e.status !== 'cancelled')
      .reduce((sum, e) => {
        const ht = e.isTtc && e.vatCents ? e.amountCents - e.vatCents : e.amountCents;
        return sum + ht;
      }, 0);
      
    const totalOutflow = ytdEntries
      .filter(e => (e.type === 'business_expense' || e.type === 'personal_drawing') && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amountCents, 0);

    return {
      totalInflow,
      totalInflowHT,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      count: ytdEntries.length
    };
  }, [entries]);

  const getMonthlyStats = useCallback((date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthlyEntries = entries.filter(e => 
      e.effectiveDate.getMonth() === month && 
      e.effectiveDate.getFullYear() === year
    );

    const totalInflow = monthlyEntries
      .filter(e => e.type === 'revenue' && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amountCents, 0);

    const totalInflowHT = monthlyEntries
      .filter(e => e.type === 'revenue' && e.status !== 'cancelled')
      .reduce((sum, e) => {
        const ht = e.isTtc && e.vatCents ? e.amountCents - e.vatCents : e.amountCents;
        return sum + ht;
      }, 0);
      
    const totalOutflow = monthlyEntries
      .filter(e => (e.type === 'business_expense' || e.type === 'personal_drawing') && e.status !== 'cancelled')
      .reduce((sum, e) => sum + e.amountCents, 0);

    return {
      totalInflow,
      totalInflowHT,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      count: monthlyEntries.length
    };
  }, [entries]);

  return {
    entries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    confirmAsReal,
    cancelForecast,
    editAndConfirm,
    splitForecast,
    seedFromProfile,
    getYearToDateCashFlow,
    getMonthlyStats,
  };
}
