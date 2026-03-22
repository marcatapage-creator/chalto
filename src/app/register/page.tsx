'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, ArrowRight, ShieldCheck, Mail, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (method: string) => {
    setLoading(true);
    try {
      if (method === 'google' || (email && password)) {
        await auth.register(email || 'demo@chalto.fr');
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Registration failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Chalto</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Rejoignez Chalto.</h1>
          <p className="text-zinc-500">Commencez à piloter votre activité fiscale dès aujourd'hui.</p>
        </div>

        <div className="space-y-4 mb-10">
          <button 
            onClick={() => handleRegister('google')}
            disabled={loading}
            className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl shadow-white/5 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            S'inscrire avec Google
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#050505] px-4 text-zinc-700 font-bold">Ou avec votre email</span>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRegister('email'); }} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="password" 
                placeholder="Mot de passe (min 8 caractères)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6 text-center">
          <p className="text-sm text-zinc-400">
            Déjà un compte ? <Link href="/login" className="text-indigo-400 font-bold hover:underline">Se connecter</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-500/50 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Cryptage de niveau bancaire
          </div>
        </div>
      </div>
      
      <footer className="mt-20 text-[10px] uppercase tracking-[0.2em] text-zinc-800">
        Chalto // Sécurité Maximale // 2026
      </footer>
    </div>
  );
}
