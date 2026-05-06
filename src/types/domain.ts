export interface ProjectDocument {
  id: string
  name: string
  type: string
  status: string
  version: number
  validation_token: string
  project_id: string
  file_url?: string
  file_name?: string
  file_type?: string
  file_size?: number
  created_at: string
  source?: string
  cloud_file_id?: string | null
}

export interface CloudLink {
  id: string
  provider: string
  remote_path: string
  last_synced_at: string | null
  sync_enabled: boolean
}

export interface Contact {
  id: string
  name: string
  professions?: { label: string }[]
}

export interface Contributor {
  id: string
  name: string
  invite_token: string
  contact_id: string
  professions?: { label: string } | null
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  assigned_to?: string
  suggested_by?: string
  due_date?: string
  contacts?: Contact
}

export interface Project {
  id: string
  name: string
  status: string
  created_at: string
  client_name?: string
  client_email?: string
  address?: string
  description?: string
  work_type?: string
  budget_range?: string
  deadline?: string
  constraints?: string
}

export type ValidationData = {
  status: string
  comment?: string | null
  approved_at?: string
  client_name?: string | null
}

// ─── Situations de travaux ────────────────────────────────────────────────────

export type SituationStatus = "en_attente" | "validee" | "refusee" | "corrigee"

export interface SituationAttachment {
  id: string
  situation_id: string
  type: "photo" | "document"
  url: string
  file_name?: string | null
  file_size?: number | null
  file_type?: string | null
  created_at: string
}

export interface Situation {
  id: string
  project_id: string
  contributor_id: string
  lot_label: string
  percentage: number
  amount_ht?: number | null
  comment?: string | null
  status: SituationStatus
  refusal_reason?: string | null
  reviewer_comment?: string | null
  parent_situation_id?: string | null
  reviewed_by?: string | null
  submitted_at: string
  reviewed_at?: string | null
  created_at: string
  updated_at: string
  // Relations jointes
  attachments?: SituationAttachment[]
  contributor?: { name: string; contact_id: string }
}

// ─── Dossiers administratifs ──────────────────────────────────────────────────

export type AdminDossierType =
  | "permis_construire"
  | "declaration_prealable"
  | "doc"
  | "daact"
  | "erp"
  | "autre"

export type AdminDossierStatus =
  | "en_preparation"
  | "depose"
  | "en_instruction"
  | "obtenu"
  | "refuse"

export interface AdminDossier {
  id: string
  project_id: string
  user_id: string
  type: AdminDossierType
  label?: string | null
  status: AdminDossierStatus
  deadline?: string | null
  notes?: string | null
  notified_thresholds: number[]
  created_at: string
  updated_at: string
}
