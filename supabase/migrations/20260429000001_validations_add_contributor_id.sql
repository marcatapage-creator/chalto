-- Lier les validations prestataire à leur contributor via FK
-- Remplace le matching fragile par client_name (string)
alter table validations
  add column if not exists contributor_id uuid references contributors(id) on delete set null;

create index if not exists idx_validations_contributor_id on validations(contributor_id);
