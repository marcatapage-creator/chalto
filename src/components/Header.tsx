'use client';

import React, { useState } from 'react';
import { Menu, X, User, Settings, Download, HelpCircle, ShieldCheck, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const key = auth.getStorageKey('chalto_user_profile');
    const saved = localStorage.getItem(key);
    if (saved) setUser(JSON.parse(saved));
  }, [pathname]);

  const handleLogout = async () => {
    await auth.logout();
    router.push('/login');
    setIsMenuOpen(false);
  };

  const userInitial = user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U';

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/';
  if (isAuthPage) return null;

  const menuItems = [
    { label: 'Profil Fiscal', icon: User, description: 'Micro-BNC • 2026', href: '/profile' },
    { label: 'Mes Hypothèses', icon: ShieldCheck, description: 'Logique du modèle', href: '/hypotheses' },
    { label: 'Paramètres', icon: Settings, description: 'App & Notifications', href: '/settings' },
    { label: 'Export & Data', icon: Download, description: 'PDF, CSV, JSON', href: '/export' },
    { label: 'Aide & Légal', icon: HelpCircle, description: 'Support Chalto', href: '/help' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[var(--background)]/20 backdrop-blur-xl border-b border-[var(--border)] transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            C
          </div>
          <span className="font-bold tracking-tighter text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--text-secondary)]">
            Chalto
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {userInitial}
            </div>
            <Menu className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>
        </div>
      </header>

      {/* Slide-over Menu (The Cold Zone) */}
      <div className={`
        fixed inset-0 z-[100] transition-opacity duration-300
        ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        
        <div className={`
          absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[var(--background)] border-l border-[var(--border)] shadow-2xl transition-transform duration-500
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-xl font-bold text-[var(--text-primary)] transition-colors duration-300">Zone Système</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
               >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest mt-0.5 transition-colors">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pt-8 border-t border-[var(--border)] space-y-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-rose-500/5 text-[var(--text-muted)] hover:text-rose-400 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center group-hover:bg-rose-500/10 transition-all">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">Déconnexion</span>
              </button>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10">
                <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2">Chalto Pro</div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed transition-colors">
                  Passez au niveau supérieur pour débloquer les exports illimités et le support prioritaire.
                </p>
                <button className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-indigo-500 transition-all">
                  Découvrir Pro
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-medium transition-colors">
                Version 1.0.4 // Chalto 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
