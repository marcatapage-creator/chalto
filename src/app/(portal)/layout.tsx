import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle,
  LogOut
} from 'lucide-react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Simple Client Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black tracking-tighter text-blue-600">
              CHALTO <span className="text-slate-900">PRO</span>
            </span>
            <div className="hidden h-4 w-[1px] bg-slate-200 sm:block"></div>
            <div className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:flex">
              <ShieldCheck size={12} className="text-blue-500" /> Espace Client
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors">
              <HelpCircle size={20} />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
