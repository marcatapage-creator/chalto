-- Correctifs Supabase Performance & Security Lints
-- Résout : auth_rls_initplan, function_search_path_mutable,
--          public_bucket_allows_listing, unindexed_foreign_keys

-- ─── 1. set_updated_at : search_path fixe + SECURITY INVOKER ─────────────────
-- (lint: function_search_path_mutable)
-- Trigger sur timestamps uniquement — aucun privilège élevé requis.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── 2. RLS init plan — (select auth.uid()) pour évaluation unique ────────────
-- (lint: auth_rls_initplan)
-- Sans le wrapper, auth.uid() est réévalué pour chaque ligne scannée.

-- situations
DROP POLICY IF EXISTS "architecte_all_situations" ON public.situations;
CREATE POLICY "architecte_all_situations"
  ON public.situations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = situations.project_id
        AND p.user_id = (SELECT auth.uid())
    )
  );

-- situation_attachments
DROP POLICY IF EXISTS "architecte_all_attachments" ON public.situation_attachments;
CREATE POLICY "architecte_all_attachments"
  ON public.situation_attachments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM   public.situations s
      JOIN   public.projects   p ON p.id = s.project_id
      WHERE  s.id = situation_attachments.situation_id
        AND  p.user_id = (SELECT auth.uid())
    )
  );

-- user_integrations
DROP POLICY IF EXISTS "owner_all_integrations" ON public.user_integrations;
CREATE POLICY "owner_all_integrations"
  ON public.user_integrations
  FOR ALL
  TO authenticated
  USING     (user_id = (SELECT auth.uid()))
  WITH CHECK(user_id = (SELECT auth.uid()));

-- project_cloud_links
DROP POLICY IF EXISTS "owner_all_cloud_links" ON public.project_cloud_links;
CREATE POLICY "owner_all_cloud_links"
  ON public.project_cloud_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_cloud_links.project_id
        AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_cloud_links.project_id
        AND p.user_id = (SELECT auth.uid())
    )
  );

-- admin_dossiers
DROP POLICY IF EXISTS "admin_dossiers_owner" ON public.admin_dossiers;
CREATE POLICY "admin_dossiers_owner"
  ON public.admin_dossiers
  FOR ALL
  USING (user_id = (SELECT auth.uid()));

-- ─── 3. Bucket situations : supprimer la politique SELECT trop large ──────────
-- (lint: public_bucket_allows_listing)
-- Le bucket est public → les URLs directes fonctionnent sans politique RLS.
-- La politique broad permettait le listing de tous les fichiers du bucket.

DROP POLICY IF EXISTS "situations_public_read" ON storage.objects;

-- ─── 4. Index sur les clés étrangères non couvertes ──────────────────────────
-- (lint: unindexed_foreign_keys)

-- admin_dossiers.user_id — utilisé dans la RLS ci-dessus (critique)
CREATE INDEX IF NOT EXISTS idx_admin_dossiers_user_id
  ON public.admin_dossiers(user_id);

-- situations.reviewed_by — nullable, index partiel
CREATE INDEX IF NOT EXISTS idx_situations_reviewed_by
  ON public.situations(reviewed_by)
  WHERE reviewed_by IS NOT NULL;

-- profession_id sur les tables de profil/projet/contacts
CREATE INDEX IF NOT EXISTS idx_contacts_profession_id
  ON public.contacts(profession_id)
  WHERE profession_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contributors_profession_id
  ON public.contributors(profession_id)
  WHERE profession_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_profession_id
  ON public.profiles(profession_id)
  WHERE profession_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_profession_id
  ON public.projects(profession_id)
  WHERE profession_id IS NOT NULL;
