export interface ValidationData {
  status: string
  comment?: string | null
  approved_at?: string
  client_name?: string
}

export interface ValidationEntry {
  status: string
  comment?: string | null
  approved_at?: string | null
  client_name?: string | null
  contributor_id?: string | null
}

export interface ContributorValidator {
  id: string
  name: string
}

export interface PrevVersion {
  version: number
  file_url: string | null
  file_name?: string
  file_type?: string
}

export interface AudienceInfo {
  requestType: "validation" | "transmission" | null
  names: string[]
}
