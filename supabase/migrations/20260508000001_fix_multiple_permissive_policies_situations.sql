-- Fix multiple permissive policies on situations / situation_attachments
-- (lint: multiple_permissive_policies)
--
-- The contributor routes use createAdminClient() which bypasses RLS entirely.
-- These policies are therefore only hit by unauthenticated (anon) callers,
-- so scoping them TO anon eliminates the overlap with the authenticated
-- architecte_all_* policies and removes the planner overhead.

-- ── situations ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "contributor_own_situations_select" ON public.situations;
CREATE POLICY "contributor_own_situations_select"
  ON public.situations
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE c.id = situations.contributor_id
        AND c.invite_token IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "contributor_insert_situation" ON public.situations;
CREATE POLICY "contributor_insert_situation"
  ON public.situations
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE c.id = situations.contributor_id
        AND c.invite_token IS NOT NULL
    )
  );

-- ── situation_attachments ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "contributor_own_attachments_select" ON public.situation_attachments;
CREATE POLICY "contributor_own_attachments_select"
  ON public.situation_attachments
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM   public.situations s
      JOIN   public.contributors c ON c.id = s.contributor_id
      WHERE  s.id = situation_attachments.situation_id
        AND  c.invite_token IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "contributor_insert_attachment" ON public.situation_attachments;
CREATE POLICY "contributor_insert_attachment"
  ON public.situation_attachments
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM   public.situations s
      JOIN   public.contributors c ON c.id = s.contributor_id
      WHERE  s.id = situation_attachments.situation_id
        AND  c.invite_token IS NOT NULL
    )
  );
