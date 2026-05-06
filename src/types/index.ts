// Statuts documents
export const DOCUMENT_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS]

// Phases projet
export const PROJECT_PHASE = {
  CADRAGE: "cadrage",
  CONCEPTION: "conception",
  VALIDATION: "validation",
  CHANTIER: "chantier",
  RECEPTION: "reception",
  CLOTURE: "cloture",
} as const

export type ProjectPhase = (typeof PROJECT_PHASE)[keyof typeof PROJECT_PHASE]

// Rôles auteurs
export const AUTHOR_ROLE = {
  PRO: "pro",
  PRESTATAIRE: "prestataire",
} as const

export type AuthorRole = (typeof AUTHOR_ROLE)[keyof typeof AUTHOR_ROLE]

// Types notifications
export const NOTIFICATION_TYPE = {
  DOCUMENT_APPROVED: "document_approved",
  DOCUMENT_REJECTED: "document_rejected",
  MESSAGE_RECEIVED: "message_received",
  TASK_ASSIGNED: "task_assigned",
  SITUATION_SUBMITTED: "situation_submitted",
  SITUATION_REVIEWED: "situation_reviewed",
  CLOUD_FILE_SYNCED: "cloud_file_synced",
  CLOUD_TOKEN_EXPIRED: "cloud_token_expired",
} as const

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]

// Audience documents
export const DOCUMENT_AUDIENCE = {
  CLIENT: "client",
  CONTRIBUTOR: "contributor",
  BOTH: "both",
} as const

export type DocumentAudience = (typeof DOCUMENT_AUDIENCE)[keyof typeof DOCUMENT_AUDIENCE]

// Providers cloud
export const CLOUD_PROVIDER = {
  DROPBOX: "dropbox",
  GDRIVE: "gdrive",
} as const

export type CloudProvider = (typeof CLOUD_PROVIDER)[keyof typeof CLOUD_PROVIDER]

// Statuts intégration cloud
export const INTEGRATION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
} as const

export type IntegrationStatus = (typeof INTEGRATION_STATUS)[keyof typeof INTEGRATION_STATUS]

// Source d'un document
export const DOCUMENT_SOURCE = {
  CHALTO: "chalto",
  DROPBOX: "dropbox",
  GDRIVE: "gdrive",
} as const

export type DocumentSource = (typeof DOCUMENT_SOURCE)[keyof typeof DOCUMENT_SOURCE]

export const CLOUD_PROVIDER_LABEL: Record<CloudProvider, string> = {
  dropbox: "Dropbox",
  gdrive: "Google Drive",
}

// Statuts tâches
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

// Fréquence notifications
export const NOTIF_FREQUENCY = {
  IMMEDIATE: "immediate",
  DAILY: "daily",
  WEEKLY: "weekly",
  NEVER: "never",
} as const

export type NotifFrequency = (typeof NOTIF_FREQUENCY)[keyof typeof NOTIF_FREQUENCY]

// Labels lisibles — pour l'UI
export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  approved: "Approuvé",
  rejected: "Refusé",
}

export const PROJECT_PHASE_LABEL: Record<ProjectPhase, string> = {
  cadrage: "Cadrage",
  conception: "Conception",
  validation: "Validation",
  chantier: "Chantier",
  reception: "Réception",
  cloture: "Clôture",
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
}
