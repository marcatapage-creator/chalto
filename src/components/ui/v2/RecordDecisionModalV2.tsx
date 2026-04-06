'use client';

import React, { useState, useEffect } from 'react';
import { ModalV2 } from './ModalV2';
import { useDecisionCommands } from '../../../core/hooks/v2/useDecisionCommands';
import { CheckCircle2, XCircle, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';
import { RecordDecisionCommand } from '../../../core/commands/v2/decision-commands';
import { ReviewRequest, DecisionOutcome, DecisionAuthority } from '../../../core/models/v2/types';

interface RecordDecisionModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  request: ReviewRequest;
  actorId: string;
  onSuccess: () => void;
}

export function RecordDecisionModalV2({ 
  isOpen, 
  onClose, 
  request, 
  actorId,
  onSuccess 
}: RecordDecisionModalV2Props) {
  const { recordDecision } = useDecisionCommands();
  const [outcome, setOutcome] = useState<DecisionOutcome>('APPROVED');
  const [rationale, setRationale] = useState('');
  const [idempotencyKey] = useState(`idem-dec-${request.id}-${Date.now()}`);

  const isRejected = outcome === 'REJECTED';
  const isValid = !isRejected || (isRejected && rationale.trim().length > 5);

  const handleDecision = async () => {
    if (!isValid) return;

    const command: RecordDecisionCommand = {
      meta: {
        commandId: `cmd-${Math.random().toString(36).substr(2, 9)}`,
        actorId,
        issuedAt: new Date().toISOString(),
        source: 'UI',
        idempotencyKey
      },
      requestId: request.id,
      outcome,
      authority: 'CONTRACTUAL', // Default for now
      rationale: rationale || undefined
    };

    const result = await recordDecision.execute(command, request);
    
    if (result && result.ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <ModalV2 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Enregistrer une décision"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Fermer
          </button>
          <button 
            onClick={handleDecision}
            disabled={!isValid || recordDecision.loading}
            className={`flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-black text-white shadow-lg transition-all disabled:opacity-50 ${
              outcome === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 
              outcome === 'REJECTED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-black'
            }`}
          >
            {recordDecision.loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Confirmer la décision
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Résultat de la revue
          </label>
          <div className="grid grid-cols-2 gap-3">
            <OutcomeButton 
              active={outcome === 'APPROVED'} 
              onClick={() => setOutcome('APPROVED')} 
              label="Approuvé" 
              icon={<CheckCircle2 size={18} />} 
              color="text-emerald-500" 
              bgColor="bg-emerald-50"
              activeColor="bg-emerald-600 text-white"
            />
            <OutcomeButton 
              active={outcome === 'REJECTED'} 
              onClick={() => setOutcome('REJECTED')} 
              label="À Revoir" 
              icon={<XCircle size={18} />} 
              color="text-rose-500" 
              bgColor="bg-rose-50"
              activeColor="bg-rose-600 text-white"
            />
            <OutcomeButton 
              active={outcome === 'CONDITIONAL'} 
              onClick={() => setOutcome('CONDITIONAL')} 
              label="Sous réserve" 
              icon={<AlertCircle size={18} />} 
              color="text-amber-500" 
              bgColor="bg-amber-50"
              activeColor="bg-amber-600 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1"><MessageSquare size={12} /> Commentaire {isRejected && "(Obligatoire pour refus)"}</span>
            <span className={rationale.length > 0 ? "text-blue-500" : ""}>{rationale.length} / 500</span>
          </label>
          <textarea 
            placeholder="Expliquez votre décision pour le pro. Si refus, indiquez les points bloquants..."
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>

        {recordDecision.error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 text-xs font-black">
            ERREUR MÉTIER : {recordDecision.error}
          </div>
        )}
      </div>
    </ModalV2>
  );
}

function OutcomeButton({ active, onClick, label, icon, color, bgColor, activeColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl p-4 text-xs font-black uppercase tracking-widest transition-all ${
        active 
          ? `${activeColor} shadow-md` 
          : `${color} ${bgColor} hover:brightness-95`
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
