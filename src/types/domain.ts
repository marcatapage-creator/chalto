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
