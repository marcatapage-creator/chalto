'use client';

import React, { useState } from 'react';
import { ModalV2 } from './ModalV2';
import { useReviewCommands } from '../../../core/hooks/v2/useReviewCommands';
import { Send, Users, Calendar, Loader2 } from 'lucide-react';
import { RequestReviewCommand } from '../../../core/commands/v2/document-commands';
import { DocumentVersion } from '../../../core/models/v2/types';

interface RequestReviewModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  version: DocumentVersion;
  projectId: string;
  actorId: string;
  recipients: { id: string, name: string }[];
  onSuccess: () => void;
}

export function RequestReviewModalV2({ 
  isOpen, 
  onClose, 
  version, 
  projectId,
  actorId,
  recipients,
  onSuccess 
}: RequestReviewModalV2Props) {
  const { requestReview } = useReviewCommands();
  const [recipientId, setRecipientId] = useState(recipients[0]?.id || '');
  const [deadline, setDeadline] = useState('');

  const handleRequest = async () => {
    if (!recipientId) return;

    const command: RequestReviewCommand = {
      meta: {
        commandId: `cmd-${Math.random().toString(36).substr(2, 9)}`,
        actorId,
        issuedAt: new Date().toISOString(),
        source: 'UI',
        idempotencyKey: `idem-req-${version.id}-${recipientId}`
      },
      versionId: version.id,
      projectId,
      requestedTo: recipientId,
      deadlineAt: deadline || undefined
    };

    const result = await requestReview.execute(command, version);
    
    if (result && result.ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <ModalV2 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Lancer une validation"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button 
            onClick={handleRequest}
            disabled={!recipientId || requestReview.loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-black text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {requestReview.loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Envoyer la demande
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Version Info Header */}
        <div className="flex items-center gap-4 rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-900/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-0.5">Document concerné</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Version {version.versionNumber} — {new Date(version.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Users size={12} /> Destinataire de la revue
            </label>
            <select 
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
            >
              {recipients.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Deadline Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Calendar size={12} /> Échéance souhaitée (Optionnel)
            </label>
            <input 
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>

        {/* Error Messaging */}
        {requestReview.error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 text-xs font-bold">
            {requestReview.error}
          </div>
        )}
      </div>
    </ModalV2>
  );
}
