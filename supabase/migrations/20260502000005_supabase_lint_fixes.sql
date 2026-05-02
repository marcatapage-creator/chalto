-- ============================================================
-- Supabase Lint Fixes (2026-05-02)
-- 1. auth_rls_initplan  → wrap auth.uid() in (select auth.uid())
-- 2. multiple_permissive_policies → scope policies to explicit roles
-- 3. duplicate_index   → drop idx_notifications_user_id
-- 4. missing FK indexes → pro_views, profiles, user_professions
-- 5. unused indexes    → drop 5 stale indexes
-- 6. anon EXECUTE      → revoke from SECURITY DEFINER functions
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. auth_rls_initplan
--    Bare auth.uid() forces a per-row sub-plan instead of a
--    single lookup. Wrapping in (select ...) evaluates once.
-- ─────────────────────────────────────────────────────────────

-- user_professions
DROP POLICY IF EXISTS "users can read own professions" ON user_professions;
CREATE POLICY "users can read own professions"
  ON user_professions FOR SELECT
  USING ((select auth.uid()) = user_id);

-- profiles (update policy added in 20260430000003)
DROP POLICY IF EXISTS "users can update own profile" ON profiles;
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE
  USING    ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- pro_views
DROP POLICY IF EXISTS "pro_views_owner" ON pro_views;
CREATE POLICY "pro_views_owner"
  ON pro_views FOR ALL
  USING    (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));


-- ─────────────────────────────────────────────────────────────
-- 2. multiple_permissive_policies
--    Multiple permissive policies on the same role + operation
--    cause the planner to OR all conditions on every row scan.
--    Fix: scope "owner" policies to TO authenticated and keep
--    anon-specific policies for TO anon only.
-- ─────────────────────────────────────────────────────────────

-- ── document_versions (SELECT + INSERT) ──────────────────────
-- Before: "Anyone can read…" (true) + "Users can manage…" both
-- apply to authenticated SELECT; "Authenticated can insert…" +
-- "Users can manage…" both apply to authenticated INSERT.

DROP POLICY IF EXISTS "Anyone can read document versions" ON document_versions;
DROP POLICY IF EXISTS "Authenticated can insert document versions" ON document_versions;
DROP POLICY IF EXISTS "Users can manage versions via documents" ON document_versions;

CREATE POLICY "document_versions_owner"
  ON document_versions
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = document_versions.document_id
        AND p.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = document_versions.document_id
        AND p.user_id = (select auth.uid())
    )
  );

-- Anon: read-only for document validation / contributor flows
CREATE POLICY "document_versions_anon_select"
  ON document_versions FOR SELECT
  TO anon
  USING (true);


-- ── documents (UPDATE) ───────────────────────────────────────
-- Before: "Users can manage documents via projects" (no role)
-- and "documents_anon_validate" (TO anon) both apply to anon UPDATE.

DROP POLICY IF EXISTS "Users can manage documents via projects" ON documents;

CREATE POLICY "documents_owner"
  ON documents
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = (select auth.uid())
    )
  );

-- Note: "documents_anon_validate" (TO anon, FOR UPDATE) remains unchanged.


-- ── project_messages (SELECT) ────────────────────────────────
-- Before: "Users can read project messages" (no role) +
-- "anon can read project_messages" (TO anon) both apply to anon SELECT.

DROP POLICY IF EXISTS "Users can read project messages" ON project_messages;

CREATE POLICY "project_messages_owner_select"
  ON project_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_messages.project_id
        AND projects.user_id = (select auth.uid())
    )
  );

-- Note: "anon can read project_messages" (TO anon) remains unchanged.


-- ── tasks (SELECT + INSERT) ───────────────────────────────────
-- Before: "Anyone can read tasks" (true) + "Users can manage tasks via projects"
-- both apply to authenticated SELECT; "Anyone can insert suggestions" +
-- "Users can manage tasks via projects" both apply to authenticated INSERT.

DROP POLICY IF EXISTS "Anyone can read tasks" ON tasks;
DROP POLICY IF EXISTS "Anyone can insert suggestions" ON tasks;
DROP POLICY IF EXISTS "Users can manage tasks via projects" ON tasks;

-- Anon: read all tasks (contributor / prestataire access)
CREATE POLICY "tasks_anon_select"
  ON tasks FOR SELECT
  TO anon
  USING (true);

-- Anon: suggest new tasks (prestataire UX)
CREATE POLICY "tasks_anon_insert_suggestions"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (status = 'suggestion');

-- Authenticated: full ownership-based access
CREATE POLICY "tasks_owner"
  ON tasks
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
        AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
        AND projects.user_id = (select auth.uid())
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 3. Duplicate index on notifications
--    notifications_user_id_idx and idx_notifications_user_id are
--    identical. Keep the shorter canonical name.
-- ─────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS idx_notifications_user_id;


-- ─────────────────────────────────────────────────────────────
-- 4. Missing FK indexes
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pro_views_project_id
  ON pro_views (project_id);

CREATE INDEX IF NOT EXISTS idx_profiles_active_profession_id
  ON profiles (active_profession_id);

CREATE INDEX IF NOT EXISTS idx_user_professions_profession_id
  ON user_professions (profession_id);


-- ─────────────────────────────────────────────────────────────
-- 5. Unused indexes
-- ─────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS idx_contacts_profession_id;
DROP INDEX IF EXISTS idx_contributors_profession_id;
DROP INDEX IF EXISTS idx_profiles_profession_id;
DROP INDEX IF EXISTS idx_projects_profession_id;
DROP INDEX IF EXISTS idx_validations_document_id;


-- ─────────────────────────────────────────────────────────────
-- 6. Revoke EXECUTE from anon on SECURITY DEFINER functions
--    These functions run with postgres privileges. Anon callers
--    should never invoke them directly.
-- ─────────────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.create_document_with_contributors(uuid, text, text, text, uuid[])
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.get_projects_unread_counts()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM anon;

REVOKE EXECUTE ON FUNCTION public.send_document_to_client(uuid, text)
  FROM anon;
