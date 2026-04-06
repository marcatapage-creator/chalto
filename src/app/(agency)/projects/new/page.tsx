import React from 'react';
import { ProjectCreationForm } from '@/components/projects/ProjectCreationForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="mx-auto max-w-2xl px-4">
        <Link 
          href="/" 
          className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
        >
          <ChevronLeft size={16} />
          RETOUR AU PORTEFEUILLE
        </Link>
        <ProjectCreationForm />
      </div>
    </div>
  );
}
