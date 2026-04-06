'use client';

import React, { useState } from 'react';
import { ModalV2 } from './ModalV2';
import { useDocumentCommands } from '../../../core/hooks/v2/useDocumentCommands';
import { FileUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { SubmitDocumentVersionCommand } from '../../../core/commands/v2/document-commands';

interface AddDocumentModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  projectId: string;
  actorId: string;
  onSuccess: () => void;
}

export function AddDocumentModalV2({ 
  isOpen, 
  onClose, 
  threadId, 
  projectId,
  actorId,
  onSuccess 
}: AddDocumentModalV2Props) {
  const { submitVersion } = useDocumentCommands();
  const [fileName, setFileName] = useState('');
  
  const handleUpload = async () => {
    if (!fileName) return;

    // Simulation of a command payload
    const command: SubmitDocumentVersionCommand = {
      meta: {
        commandId: `cmd-${Math.random().toString(36).substr(2, 9)}`,
        actorId,
        issuedAt: new Date().toISOString(),
        source: 'UI',
        idempotencyKey: `idem-${threadId}-${fileName}`
      },
      threadId,
      storageKey: `s3://chalto-uploads/${projectId}/${fileName}`,
      fileHash: `hash-${fileName}-${Date.now()}`
    };

    const result = await submitVersion.execute(command, threadId);
    
    if (result && result.ok) {
      onSuccess();
      onClose();
    }
  };

  return (
    <ModalV2 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Ajouter une version"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button 
            onClick={handleUpload}
            disabled={!fileName || submitVersion.loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-black text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {submitVersion.loading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
            Uploader la version
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <FileUp size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {fileName || "Cliquez pour uploader un fichier"}
            </p>
            <p className="text-xs text-slate-500">PDF, DWG, JPG (Max 20MB)</p>
            <input 
              type="text" 
              placeholder="Nom du fichier (simulation)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>

        {/* Messaging Logic */}
        {submitVersion.error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-xs font-bold">{submitVersion.error}</p>
          </div>
        )}

        {submitVersion.warnings.length > 0 && (
          <div className="space-y-2 text-amber-700">
            {submitVersion.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-xs font-bold">{w}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalV2>
  );
}
