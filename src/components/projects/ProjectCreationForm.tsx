'use client';

import React, { useState, useTransition } from 'react';
import { 
  Plus, 
  Mail, 
  MapPin, 
  Type, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ProjectType } from '@/core/types';
import { getPhasesForType } from '@/core/logic/phase-resolver';
import { useRouter } from 'next/navigation';

export function ProjectCreationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    clientEmail: '',
    type: 'RENOVATION' as ProjectType,
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const phasesPreview = getPhasesForType('preview', formData.type);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 3) newErrors.name = 'Le nom doit faire au moins 3 caractères.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) newErrors.clientEmail = 'Email invalide.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    startTransition(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/projects/id?status=new');
    });
  };

  const projectTypes: { value: ProjectType; label: string; icon: string }[] = [
    { value: 'CONSTRUCTION', label: 'Construction', icon: '🏗️' },
    { value: 'RENOVATION', label: 'Rénovation', icon: '🏠' },
    { value: 'EXTENSION', label: 'Extension', icon: '➕' },
    { value: 'AMENAGEMENT', label: 'Aménagement', icon: '✨' },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="p-8">
          <div className="mb-10 sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Nouveau projet
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Action immédiate. Détails plus tard.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nom du projet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Type className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-500' : 'text-slate-400'}`} size={18} />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) validate();
                  }}
                  placeholder="ex: Extension Maison Dupont"
                  className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition-all dark:bg-slate-900 ${
                    errors.name ? 'border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[10px] font-bold text-red-500">{errors.name}</p>}
            </div>

            {/* Client Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Email du client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.clientEmail ? 'text-red-500' : 'text-slate-400'}`} size={18} />
                <input
                  required
                  type="email"
                  value={formData.clientEmail}
                  onChange={e => {
                    setFormData({ ...formData, clientEmail: e.target.value });
                    if (errors.clientEmail) validate();
                  }}
                  placeholder="client@email.com"
                  className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition-all dark:bg-slate-900 ${
                    errors.clientEmail ? 'border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <Info size={10} />
                <span>Le client pourra être complété plus tard.</span>
              </div>
              {errors.clientEmail && <p className="text-[10px] font-bold text-red-500">{errors.clientEmail}</p>}
            </div>

            {/* Project Type */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Type de projet <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {projectTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition-all ${
                      formData.type === type.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm font-bold'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Section (Collapsed by default) */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-600"
              >
                <span>Options (Facultatif)</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-6 border-t border-slate-100 p-4 dark:border-slate-800">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400">Adresse</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Adresse du projet"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400">Phases générées automatiquement</label>
                    <div className="flex flex-wrap gap-1.5">
                      {phasesPreview.map(phase => (
                        <span key={phase.name} className="flex items-center gap-1 rounded bg-slate-200/50 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">
                          <CheckCircle2 size={10} className="text-slate-400" />
                          {phase.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isPending}
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-black focus:ring-4 focus:ring-slate-900/20 disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <span>CRÉER LE PROJET</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
        Vous pourrez modifier ces informations après la création.
      </p>
    </div>
  );
}
