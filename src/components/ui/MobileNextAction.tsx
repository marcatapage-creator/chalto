'use client';

import React, { useState } from 'react';
import { NextAction } from '@/core/types';
import { 
  ChevronUp, 
  ChevronDown, 
  AlertCircle, 
  Info, 
  Clock, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface MobileNextActionProps {
  action: NextAction;
  onComplete?: () => void;
  onEdit?: () => void;
}

export const MobileNextAction: React.FC<MobileNextActionProps> = ({ 
  action, 
  onComplete 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyles = () => {
    switch (action.priority) {
      case 'URGENT': return 'bg-red-600 text-white animate-pulse-subtle';
      case 'IMPORTANT': return 'bg-blue-600 text-white';
      case 'WARNING': return 'bg-amber-500 text-white';
      default: return 'bg-slate-800 text-white';
    }
  };

  const getPriorityIcon = () => {
    switch (action.priority) {
      case 'URGENT': return <AlertCircle size={20} />;
      case 'IMPORTANT': return <CheckCircle2 size={20} />;
      case 'WARNING': return <Clock size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full p-4 sm:hidden">
      <div 
        className={`overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ease-in-out ${getPriorityStyles()} ${
          isExpanded ? 'max-h-[400px]' : 'max-h-[64px]'
        }`}
      >
        {/* Compact Mode Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-[64px] items-center justify-between px-5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {getPriorityIcon()}
            <span className="text-sm font-black tracking-tight truncate max-w-[200px]">
              {action.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
              {isExpanded ? 'Fermer' : 'Détails'}
            </span>
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-white/10 bg-black/5 p-6 space-y-4">
            {action.description && (
              <p className="text-sm font-bold opacity-90 leading-relaxed">
                {action.description}
              </p>
            )}
            
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={() => {
                  onComplete?.();
                  setIsExpanded(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-black text-slate-900 shadow-xl active:scale-95 transition-transform"
              >
                Effectuer l'action <ArrowRight size={18} />
              </button>
              
              <button 
                onClick={() => setIsExpanded(false)}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest opacity-70 py-2"
              >
                Plus tard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
