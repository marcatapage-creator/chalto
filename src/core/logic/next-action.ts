import { Project, Document, NextAction, ValidationRequest } from '../types';

/**
 * Next Action Engine V2.2 (SERVER-READY):
 * - 100% Deterministic (Pure Functions)
 * - Timing Thresholds: 48h (Important), 72h (Urgent)
 * - Aging Logic: 10-day stage threshold
 */
export function getDisplayedNextAction(
  project: Project, 
  documents: Document[], 
  validations: ValidationRequest[],
  now: Date = new Date()
): NextAction {
  // 1. Manual Override (Primary)
  if (project.nextActionOverride) {
    return {
      ...project.nextActionOverride,
      type: 'MANUAL',
    };
  }

  // 2. Compute System Action (Priority-based Rules)
  return computeSystemNextAction(project, documents, validations, now);
}

function computeSystemNextAction(
  project: Project, 
  documents: Document[], 
  validations: ValidationRequest[],
  now: Date
): NextAction {
  // Rule 1: Validation Rejected (URGENT)
  const rejectedValidations = validations.filter(v => v.status === 'rejected');
  if (rejectedValidations.length > 0) {
    const doc = documents.find(d => d.id === rejectedValidations[0].documentId);
    return {
      label: `Corriger le document rejeté : ${doc?.name || 'Document'}`,
      type: 'VALIDATION',
      priority: 'URGENT',
      description: `Le client a refusé la version ${rejectedValidations[0].documentVersionNumber}.`,
    };
  }

  // Rule 2: Silence Detection (Pending Validations)
  const pendingValidations = validations.filter(v => v.status === 'pending' || v.status === 'viewed');
  if (pendingValidations.length > 0) {
    const earliestPending = pendingValidations[0];
    const requestedAt = new Date(earliestPending.requestedAt);
    const diffHours = (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60);

    if (diffHours > 72) {
      return {
        label: "À RELANCER : Client silencieux depuis 3 jours",
        type: 'VALIDATION',
        priority: 'URGENT',
        description: `La validation de "${earliestPending.documentId}" est en attente depuis plus de 72h.`,
      };
    } else if (diffHours > 48) {
      return {
        label: "Relance client suggérée (J+2)",
        type: 'VALIDATION',
        priority: 'WARNING',
        description: "Le client a consulté le document mais n'a pas encore répondu.",
      };
    } else {
      return {
        label: "En attente de validation client",
        type: 'VALIDATION',
        priority: 'IMPORTANT',
        description: `Document envoyé le ${requestedAt.toLocaleDateString('fr-FR')}.`,
      };
    }
  }

  // Rule 3: Aging Logic (Stage progression)
  const statusAgeMs = now.getTime() - new Date(project.statusChangedAt).getTime();
  const statusAgeDays = statusAgeMs / (1000 * 60 * 60 * 24);

  if (statusAgeDays > 10) {
    return {
      label: `Faire progresser le projet : ${formatStage(project.status)}`,
      type: 'SYSTEM',
      priority: 'IMPORTANT',
      description: `Cette étape est active depuis ${Math.floor(statusAgeDays)} jours.`,
    };
  }

  // Rule 4: Stage Fallbacks
  const docsInStage = documents.filter(d => d.stage === project.status);
  if (docsInStage.length === 0) {
    return {
      label: `Lancer l'étape ${formatStage(project.status)}`,
      type: 'SYSTEM',
      priority: 'IMPORTANT',
      description: "Aucun document n'a été partagé pour cette phase.",
    };
  }

  // Rule 5: Default (INFO)
  return {
    label: "Tout est à jour",
    type: 'SYSTEM',
    priority: 'INFO',
    description: "Le projet avance normalement selon le calendrier.",
  };
}

function formatStage(status: string): string {
  const labels: Record<string, string> = {
    REQUEST: 'Demande',
    STUDY: 'Étude',
    PROPOSAL: 'Proposition',
    VALIDATION: 'Validation',
    EXECUTION: 'Suivi de chantier',
    CLOSURE: 'Clôture',
  };
  return labels[status] || status;
}
