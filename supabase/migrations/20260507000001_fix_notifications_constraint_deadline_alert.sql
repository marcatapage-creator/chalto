-- ─────────────────────────────────────────────────────────────────────────────
-- Fix : deadline_alert retiré par erreur de la contrainte notifications_type_check
-- lors de la migration 20260505000003_dropbox_webhook.sql (DROP + ADD constraint
-- sans inclure deadline_alert utilisé par le cron d'alertes).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check,
  ADD CONSTRAINT notifications_type_check CHECK (
    type = ANY (ARRAY[
      'document_approved',
      'document_rejected',
      'message_received',
      'task_assigned',
      'situation_submitted',
      'situation_reviewed',
      'cloud_file_synced',
      'cloud_token_expired',
      'deadline_alert'
    ])
  );

-- ── Storage bucket situations (idempotent) ───────────────────────────────────
-- Manquait dans la migration 20260505000001 (commentaire uniquement, pas de SQL).
INSERT INTO storage.buckets (id, name, public)
VALUES ('situations', 'situations', true)
ON CONFLICT (id) DO NOTHING;

-- Policy : service role bypass RLS — ces policies couvrent les accès directs
DROP POLICY IF EXISTS "situations_public_read" ON storage.objects;
CREATE POLICY "situations_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'situations');
