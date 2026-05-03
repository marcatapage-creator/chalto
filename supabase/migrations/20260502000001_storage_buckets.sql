-- Création des buckets storage (idempotent)
-- Le bucket "documents" est public : les fichiers sont servis via getPublicUrl()
-- Le bucket "logos" est public : les avatars/logos pro sont accessibles en lecture

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', true),
  ('logos',     'logos',     true)
ON CONFLICT (id) DO NOTHING;

-- ─── Policies bucket documents ──────────────────────────────────────────────
-- Les uploads via service role (generate-document, add-document) byppassent
-- le RLS — ces policies couvrent les uploads directs côté client.

DROP POLICY IF EXISTS "documents_owner_select" ON storage.objects;
CREATE POLICY "documents_owner_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_owner_insert" ON storage.objects;
CREATE POLICY "documents_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_owner_update" ON storage.objects;
CREATE POLICY "documents_owner_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "documents_owner_delete" ON storage.objects;
CREATE POLICY "documents_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
