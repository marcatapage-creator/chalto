import { DomainError, DomainWarning } from '../commands/v2/index';

/**
 * DomainErrorMap
 * Translates technical DomainErrors into human-friendly messages.
 */
export const DOMAIN_ERROR_MAPPING: Record<DomainError, string> = {
  'REVIEW_REQUEST_ALREADY_DECIDED': "Cette demande de revue a déjà fait l'objet d'une décision finale.",
  'DOCUMENT_VERSION_ALREADY_WITHDRAWN': "Ce document a été retiré et ne peut plus être traité.",
  'DECISION_SCOPE_MISMATCH': "La portée de cette décision ne correspond pas à la demande initiale.",
  'INVALID_SUPERSESSION_TARGET': "La décision que vous tentez de remplacer n'est plus valide.",
  'IDEMPOTENCY_CONFLICT': "Cette action est déjà en cours ou a déjà été traitée (Conflit d'Idempotence).",
  'UNAUTHORIZED_ACTION': "Vous n'avez pas les droits nécessaires pour effectuer cette action métier.",
  'ENTITY_NOT_FOUND': "L'élément cible est introuvable ou a été supprimé."
};

/**
 * DomainWarningMap
 */
export const DOMAIN_WARNING_MAPPING: Record<DomainWarning, string> = {
  'LATEST_VERSION_ALREADY_EXISTS': "Une version identique de ce document existe déjà dans le thread.",
  'MISSING_OPTIONAL_RATIONALE': "Il est recommandé d'ajouter un commentaire pour expliquer votre décision."
};

/**
 * Utility to get a message from an error/warning
 */
export function getHumanMessage(code: DomainError | DomainWarning): string {
  return (DOMAIN_ERROR_MAPPING[code as DomainError] || 
          DOMAIN_WARNING_MAPPING[code as DomainWarning] || 
          "Une erreur métier inconnue est survenue.");
}
