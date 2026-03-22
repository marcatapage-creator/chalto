'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Plus, 
  Activity, 
  Zap 
} from 'lucide-react';
import { QuickActionModal } from './QuickActionModal';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(prev => prev ? false : prev);
      } else {
        setIsVisible(prev => prev ? prev : true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle visibility based on route
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/onboarding') || pathname === '/';
  if (isAuthPage) return null;

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Timeline', href: '/timeline', icon: Calendar },
    { name: 'Plus', href: '#', icon: Plus, isAction: true },
    { name: 'Réalité', href: '/real-activity', icon: Activity },
    { name: 'Simu', href: '/scenarios', icon: Zap },
  ];

  return (
    <>
      <nav className={`
        fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 transform
        px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
      `}>
        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between px-6 py-4 rounded-full bg-[var(--surface)] backdrop-blur-2xl border border-[var(--border)] shadow-xl relative transition-colors duration-300">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
 
              if (item.isAction) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center -mt-12 transition-transform hover:scale-110 active:scale-95 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-[0_0_30px_rgba(99,102,241,0.4)] relative overflow-hidden">
                      <div className="w-full h-full rounded-full bg-[var(--background)] flex items-center justify-center transition-colors duration-300">
                        <Plus className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-500" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20 pointer-events-none duration-[3000ms]" />
                    </div>
                  </button>
                );
              }
 
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="flex flex-col items-center gap-1 group relative h-10 justify-center"
                >
                  <Icon className={`
                    w-5 h-5 transition-all duration-300
                    ${isActive ? 'text-indigo-400 scale-110' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}
                  `} />
                  <span className={`
                    text-[10px] uppercase tracking-widest font-medium transition-all duration-300
                    ${isActive ? 'text-indigo-400 opacity-100' : 'text-[var(--text-secondary)] opacity-0 group-hover:opacity-100'}
                  `}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <QuickActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
