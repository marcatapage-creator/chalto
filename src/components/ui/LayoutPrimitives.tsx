import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, backUrl, actions }) => {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0 lg:mb-10">
      <div className="flex flex-col">
        {backUrl && (
          <Link
            href={backUrl}
            className="mb-2 flex w-fit items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={16} /> Retour
          </Link>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, actions, className }) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          {title && (
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
