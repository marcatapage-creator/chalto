-- ─────────────────────────────────────────────────────────────────────────────
-- Dropbox webhook — curseur incrémental + types notification cloud
-- Sprint 4 · Mai 2026
-- ─────────────────────────────────────────────────────────────────────────────

-- Curseur Dropbox pour la sync incrémentale (list_folder/continue)
-- Stocké après chaque sync pour éviter de re-lister tout le dossier à chaque webhook
ALTER TABLE public.project_cloud_links
  ADD COLUMN cursor TEXT;

-- Étendre le CHECK de notifications pour inclure :
--   • situation_submitted / situation_reviewed (utilisés depuis Sprint Situations mais manquants)
--   • cloud_file_synced — nouveau fichier Dropbox détecté
--   • cloud_token_expired — token Dropbox expiré/révoqué
ALTER TABLE public.notifications
  DROP CONSTRAINT notifications_type_check,
  ADD CONSTRAINT notifications_type_check CHECK (
    type = ANY (ARRAY[
      'document_approved',
      'document_rejected',
      'message_received',
      'task_assigned',
      'situation_submitted',
      'situation_reviewed',
      'cloud_file_synced',
      'cloud_token_expired'
    ])
  );
