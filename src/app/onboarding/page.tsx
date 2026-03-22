import React from 'react';
import { OnboardingFlow } from '../../components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 selection:bg-indigo-500/30">
      <header className="fixed top-0 left-0 right-0 p-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 rotate-12 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg leading-none">C</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            Chalto
          </h1>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">
          Onboarding // 2026
        </div>
      </header>
      
      <main className="pt-24 pb-12">
        <OnboardingFlow />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-700 pointer-events-none">
        Conçu pour la liberté // Propulsé par la clarté
      </footer>
    </div>
  );
}
