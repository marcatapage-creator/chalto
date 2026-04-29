-- Indexes sur les clés étrangères non indexées
-- Toutes les FK PostgreSQL sont sans index par défaut côté colonne référençante.
-- Ces indexes améliorent les jointures, les lookups RLS et les requêtes filtrées.

-- contacts
create index if not exists idx_contacts_user_id on contacts(user_id);

-- contributors
create index if not exists idx_contributors_project_id on contributors(project_id);
create index if not exists idx_contributors_contact_id on contributors(contact_id);
create index if not exists idx_contributors_invite_token on contributors(invite_token);

-- documents
create index if not exists idx_documents_project_id on documents(project_id);
create index if not exists idx_documents_validation_token on documents(validation_token);

-- document_contributors
create index if not exists idx_document_contributors_document_id on document_contributors(document_id);
create index if not exists idx_document_contributors_contributor_id on document_contributors(contributor_id);

-- document_versions
create index if not exists idx_document_versions_document_id on document_versions(document_id);

-- validations
create index if not exists idx_validations_document_id on validations(document_id);
create index if not exists idx_validations_document_id_created_at on validations(document_id, created_at desc);

-- tasks
create index if not exists idx_tasks_project_id on tasks(project_id);
create index if not exists idx_tasks_assigned_to on tasks(assigned_to);

-- notifications
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_user_id_created_at on notifications(user_id, created_at desc);

-- messages / project_messages
create index if not exists idx_messages_document_id on messages(document_id);
create index if not exists idx_project_messages_project_id on project_messages(project_id);
