import React, { useState } from 'react';
import { Document, ProjectMember, Project } from '@/core/types';
import { SectionCard } from './LayoutPrimitives';
import { Send, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface SendForValidationProps {
  project: Project;
  document: Document;
  recipient: ProjectMember;
  onSend: (message?: string, context?: string) => void;
}

export const ValidationAction: React.FC<SendForValidationProps> = ({
  project,
  document,
  recipient,
  onSend,
}) => {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState("l'aménagement général de la cuisine et du séjour");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    await onSend(message, context);
    setIsSending(false);
  };

  return (
    <SectionCard title="Demande de Validation" className="shadow-lg border-blue-100">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FileIcon document={document} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">{document.name}</h4>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold">Version ${document.versionNumber}</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">Envoyé à : ${recipient.name}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Ce que le client valide (Contexte)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ex: L'implantation de la cuisine..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm outline-none transition-all focus:border-blue-500"
            />
            <p className="text-[10px] font-medium text-slate-400">
              Ce texte apparaîtra sur le bouton de validation du client.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Message d'accompagnement (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Bonjour Marc, voici la nouvelle version..."
              className="w-full min-h-[80px] rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium outline-none transition-all focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={14} className="text-blue-500" />
            <span>Déclenche un email automatique</span>
          </div>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:animate-pulse"
          >
            <Send size={16} /> {isSending ? 'Envoi...' : 'Envoyer pour Validation'}
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

function FileIcon({ document }: { document: Document }) {
  if (document.status === 'APPROVED') return <CheckCircle size={20} />;
  if (document.status === 'REJECTED') return <XCircle size={20} />;
  return <AlertCircle size={20} />;
}
