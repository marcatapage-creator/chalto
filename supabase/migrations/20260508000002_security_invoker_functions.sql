-- Passe les 3 fonctions SECURITY DEFINER en SECURITY INVOKER
-- (lint: signed_in_users_can_execute_security_definer)
--
-- SECURITY INVOKER est sûr ici car :
--   - get_projects_unread_counts : toutes les tables ont des policies SELECT
--     pour authenticated (validations, task_comments, project_messages, situations,
--     projects, pro_views) — le filtre auth.uid() dans la fonction reste identique.
--   - create_document_with_contributors : documents (documents_owner WITH CHECK) +
--     document_contributors (Authenticated can insert) couvrent l'INSERT.
--   - send_document_to_client : documents_owner WITH CHECK couvre l'UPDATE
--     et renforce même la sécurité (ownership vérifié via RLS au lieu d'être absent).

-- ── get_projects_unread_counts ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_projects_unread_counts()
RETURNS TABLE(project_id UUID, unread_count INTEGER)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS project_id,
    CAST(
      (
        SELECT COUNT(*) FROM (
          SELECT v.id
          FROM   validations v
          JOIN   documents   d ON d.id = v.document_id
          WHERE  d.project_id = p.id
          AND    v.created_at > pv.last_viewed_at

          UNION ALL

          SELECT tc.id
          FROM   task_comments tc
          JOIN   tasks          t ON t.id = tc.task_id
          WHERE  t.project_id       = p.id
          AND    tc.author_role      = 'prestataire'
          AND    tc.created_at       > pv.last_viewed_at

          UNION ALL

          SELECT pm.id
          FROM   project_messages pm
          WHERE  pm.project_id  = p.id
          AND    pm.author_role = 'prestataire'
          AND    pm.created_at  > pv.last_viewed_at

          UNION ALL

          SELECT s.id
          FROM   situations s
          WHERE  s.project_id   = p.id
          AND    s.submitted_at > pv.last_viewed_at
        ) AS activities
      )
    AS INTEGER) AS unread_count
  FROM   projects  p
  JOIN   pro_views pv ON pv.project_id = p.id AND pv.user_id = auth.uid()
  WHERE  p.user_id = auth.uid();
$$;

-- ── create_document_with_contributors ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_document_with_contributors(
  p_project_id     uuid,
  p_name           text,
  p_type           text,
  p_audience       text    DEFAULT 'client'::text,
  p_contributor_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
declare
  v_document_id uuid;
begin
  insert into documents (project_id, name, type, status, audience)
  values (p_project_id, p_name, p_type, 'draft', p_audience)
  returning id into v_document_id;

  if array_length(p_contributor_ids, 1) > 0 then
    insert into document_contributors (document_id, contributor_id)
    select v_document_id, unnest(p_contributor_ids);
  end if;

  return v_document_id;
end;
$$;

-- ── send_document_to_client ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.send_document_to_client(
  p_document_id uuid,
  p_status      text DEFAULT 'sent'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
begin
  update documents
  set status = p_status
  where id = p_document_id;
end;
$$;
