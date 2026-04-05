import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  FolderKanban, 
  Settings, 
  Users, 
  LogOut, 
  PlusCircle,
  Bell
} from 'lucide-react';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:flex">
        <div className="flex h-20 items-center border-b border-slate-100 px-6 dark:border-slate-800">
          <span className="text-2xl font-black tracking-tighter text-blue-600">
            CHALTO <span className="text-slate-900 dark:text-white">PRO</span>
          </span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          <Link 
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <BarChart3 size={20} /> Portefeuille
          </Link>
          <Link 
            href="/projects"
            className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-900/20"
          >
            <FolderKanban size={20} /> Mes Projets
          </Link>
          <Link 
            href="/contacts"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Users size={20} /> Annuaire
          </Link>
        </nav>

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900">
            <Settings size={20} /> Paramètres
          </button>
          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
              <PlusCircle size={14} /> NOUVEAU PROJET
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-blue-600">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-950"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-sm border border-white"></div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
