import React from 'react';
import { NextActionCandidate } from '@/core/models/v2/types';
import { 
  CheckCircle, 
  AlertCircle, 
  Edit2, 
  RotateCcw, 
  Bell, 
  Clock, 
  Info 
} from 'lucide-react';

interface StickyNextActionProps {
  action: NextActionCandidate;
  onEdit?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
}

const PRIORITY_STYLES: Record<string, { 
  bg: string; 
  text: string; 
  border: string; 
  icon: React.ReactNode; 
  label: string 
}> = {
  URGENT: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-600',
    icon: <AlertCircle size={20} />,
    label: 'URGENT',
  },
  IMPORTANT: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-500',
    icon: <Clock size={20} />,
    label: 'IMPORTANT',
  },
  INFO: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-500',
    icon: <Info size={20} />,
    label: 'INFO',
  },
};

export const StickyNextAction: React.FC<StickyNextActionProps> = ({
  action,
  onEdit,
  onComplete,
  onReset,
}) => {
  const style = PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.INFO;

  return (
    <div className={`sticky top-0 z-30 w-full border-b-2 ${style.border} ${style.bg} shadow-sm transition-all duration-300`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ${style.text}`}>
            {style.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.text}`}>
                {action.type.replace(/_/g, ' ')} • {style.label}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 line-clamp-1">
              {action.reason}
            </h2>
            <p className="max-w-md text-xs font-medium text-slate-500 line-clamp-1">
              Cible ID: {action.target.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs font-bold text-slate-700 backdrop-blur-sm hover:bg-white sm:flex"
          >
            <Edit2 size={14} /> MODIFIER
          </button>
          <button
            onClick={onComplete}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
              action.priority === 'URGENT' ? 'bg-red-600 shadow-red-200' : 'bg-slate-900 shadow-slate-200'
            }`}
          >
            {action.priority === 'URGENT' && <Bell size={14} className="animate-pulse" />}
            MARQUER COMME FAIT
          </button>
        </div>
      </div>
    </div>
  );
};
