import React from 'react';
import { ProjectStatus } from '@/core/types';
import { Check, ChevronRight } from 'lucide-react';

interface StepTimelineProps {
  currentStatus: ProjectStatus;
}

const STEPS: { key: ProjectStatus; label: string }[] = [
  { key: 'REQUEST', label: 'Demande' },
  { key: 'STUDY', label: 'Étude' },
  { key: 'PROPOSAL', label: 'Proposition' },
  { key: 'VALIDATION', label: 'Validation' },
  { key: 'EXECUTION', label: 'Suivi' },
  { key: 'CLOSURE', label: 'Clôture' },
];

export const StepTimeline: React.FC<StepTimelineProps> = ({ currentStatus }) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex w-full items-center justify-between overflow-x-auto px-4 py-8 sm:px-0">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isActive
                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md ring-4 ring-blue-50/50'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={20} /> : index + 1}
              </div>
              <span
                className={`mt-3 whitespace-nowrap text-xs font-bold uppercase tracking-wider ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="mx-2 flex-grow border-t-2 border-slate-100 last:hidden sm:mx-6">
                <ChevronRight size={14} className="mx-auto -mt-2 text-slate-300" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
