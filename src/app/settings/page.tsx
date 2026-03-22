'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Wallet, Moon, Globe, ChevronRight, Save, Sun, Monitor, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [prudentMode, setPrudentMode] = useState(true);
  const [alerts, setAlerts] = useState({
    tva: 36000,
    urssaf: 1000,
    treasuryFloor: 2, // months
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500/30 pb-32 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          </div>
          <p className="text-zinc-500 max-w-2xl">
            Configurez votre tolérance au risque et vos seuils d'alerte pour un pilotage sur-mesure.
          </p>
        </header>

        <div className="space-y-12">
          
          {/* Section: Pilotage & Alertes */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-200">Pilotage & Alertes</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Alerte Seuil TVA</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">Être prévenu lorsque le CA approche de :</div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={alerts.tva}
                    onChange={(e) => setAlerts({...alerts, tva: parseInt(e.target.value)})}
                    className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs font-bold text-zinc-600">€</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Tension de Trésorerie</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">Alerte si la couverture de charge descend sous :</div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={alerts.urssaf}
                    onChange={(e) => setAlerts({...alerts, urssaf: parseInt(e.target.value)})}
                    className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs font-bold text-zinc-600">€</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Mode Prudent */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-200">Sécurité du Modèle</h2>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Mode Prudent Automatique</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    Applique une marge de sécurité supplémentaire (15%) si la fiabilité des données est faible.
                  </p>
                </div>
                <button 
                  onClick={() => setPrudentMode(!prudentMode)}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${prudentMode ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${prudentMode ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-emerald-400/80 leading-relaxed italic">
                * Actuellement : Votre safe-to-spend est calculé avec une marge de prudence de 10% par défaut.
              </div>
            </div>
          </section>

          {/* Section: App Settings */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Moon className="w-5 h-5 text-zinc-500" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-200">Application</h2>
            </div>
            
            <div className="space-y-4">
              <div 
                onClick={() => setShowThemeModal(true)}
                className="flex items-center justify-between p-6 rounded-2xl hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <Moon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Apparence</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  {theme === 'system' ? 'Système' : theme === 'light' ? 'Clair' : 'Sombre (OLED)'} <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Langue</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  Français <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Theme Selector Modal */}
          {showThemeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowThemeModal(false)} />
              <div className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Apparence</h3>
                  <button onClick={() => setShowThemeModal(false)} className="p-2 rounded-full hover:bg-[var(--surface-hover)] text-[var(--text-muted)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'system', label: 'Système', icon: Monitor, desc: 'Suit les réglages de votre appareil' },
                    { id: 'light', label: 'Clair', icon: Sun, desc: 'Interface lumineuse et aérée' },
                    { id: 'dark', label: 'Sombre (OLED)', icon: Moon, desc: 'Noir pur pour économiser la batterie' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setTheme(option.id as any);
                        setShowThemeModal(false);
                      }}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                        ${theme === option.id 
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                          : 'bg-[var(--surface)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border)]'}
                      `}
                    >
                      <div className={`p-2 rounded-xl ${theme === option.id ? 'bg-indigo-500/20' : 'bg-black/20'}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{option.label}</div>
                        <div className="text-[10px] opacity-60 uppercase tracking-widest mt-1 font-medium">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Footer */}
          <footer className="pt-12 border-t border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-700">
              ID Système : CH-0921-2026
            </div>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">
              <Save className="w-4 h-4" /> Enregistrer les préférences
            </button>
          </footer>

        </div>
      </div>
    </div>
  );
}
