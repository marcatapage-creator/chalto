'use client';

import React, { useEffect } from 'react';
import { UserProfile } from '../../models/user';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useLedger } from '@/core/ledger/ledger-hook';

interface OnboardingResultProps {
  data: UserProfile;
}

import { auth } from '@/lib/auth';

export function OnboardingResult({ data }: OnboardingResultProps) {
  const router = useRouter();

  const { seedFromProfile } = useLedger();

  useEffect(() => {
    // 1. Save profile
    const key = auth.getStorageKey('chalto_user_profile');
    localStorage.setItem(key, JSON.stringify(data));
    
    // 2. Seed Ledger
    seedFromProfile(data);
    
    // 3. Delay for effect
    const timer = setTimeout(() => {
      router.push('/score');
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, router, seedFromProfile]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-20 animate-in fade-in duration-700">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-indigo-400 opacity-0 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white italic">Synchronisation...</h2>
        <p className="text-zinc-500">Nous assemblons vos pièces financières pour calculer votre Safe-to-Spend.</p>
      </div>
    </div>
  );
}
