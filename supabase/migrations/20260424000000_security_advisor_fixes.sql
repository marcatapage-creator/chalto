-- ============================================================
-- Security Advisor — fixes appliqués le 2026-04-24
-- 5ème warning (Leaked Password Protection) : activer dans
-- le dashboard Supabase → Auth > Security
-- ============================================================


-- ============================================================
-- 1 & 2. Function Search Path Mutable
--   Fonctions SECURITY DEFINER sans search_path fixé.
--   Fix : SET search_path = '' + noms de tables qualifiés public.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_document_with_contributors(
  p_project_id uuid,
  p_name text,
  p_type text,
  p_audience text DEFAULT 'client'::text,
  p_contributor_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
declare
  v_document_id uuid;
begin
  insert into public.documents (project_id, name, type, status, audience)
  values (p_project_id, p_name, p_type, 'draft', p_audience)
  returning id into v_document_id;

  if array_length(p_contributor_ids, 1) > 0 then
    insert into public.document_contributors (document_id, contributor_id)
    select v_document_id, unnest(p_contributor_ids);
  end if;

  return v_document_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.send_document_to_client(
  p_document_id uuid,
  p_status text DEFAULT 'sent'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
begin
  update public.documents
  set status = p_status
  where id = p_document_id;
end;
$function$;


-- ============================================================
-- 3. RLS Policy Always True — public.validations
--   Les policies INSERT permissives sont inutiles : toutes les
--   insertions passent par l'admin client (bypass RLS).
--   Une policy SELECT owner-only remplace l'ancien USING (true).
-- ============================================================

DROP POLICY IF EXISTS "Public can insert validations" ON public.validations;
DROP POLICY IF EXISTS "validations_anon_insert" ON public.validations;

DROP POLICY IF EXISTS "validations_owner_select" ON public.validations;
CREATE POLICY "validations_owner_select"
  ON public.validations
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT d.id
      FROM   public.documents d
      JOIN   public.projects  p ON p.id = d.project_id
      WHERE  p.user_id = auth.uid()
    )
  );


-- ============================================================
-- 4. Public Bucket Allows Listing — storage.logos
--   Remplace la policy SELECT permissive par une policy
--   restreinte au propriétaire du dossier.
--   Les URLs publiques (pages invitation) continuent de
--   fonctionner via le flag public du bucket.
-- ============================================================

DROP POLICY IF EXISTS "logos_owner_select" ON storage.objects;
CREATE POLICY "logos_owner_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "logos_owner_insert" ON storage.objects;
CREATE POLICY "logos_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "logos_owner_update" ON storage.objects;
CREATE POLICY "logos_owner_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "logos_owner_delete" ON storage.objects;
CREATE POLICY "logos_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
