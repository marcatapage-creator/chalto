-- Ajoute les project_messages (prestataire) au comptage unread de get_projects_unread_counts

CREATE OR REPLACE FUNCTION get_projects_unread_counts()
RETURNS TABLE(project_id UUID, unread_count INTEGER)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS project_id,
    CAST(
      (
        SELECT COUNT(*) FROM (
          -- Validations (client ou prestataire) postérieures à la dernière vue
          SELECT v.id
          FROM   validations v
          JOIN   documents   d ON d.id = v.document_id
          WHERE  d.project_id = p.id
          AND    v.created_at > pv.last_viewed_at

          UNION ALL

          -- Commentaires de tâche côté prestataire
          SELECT tc.id
          FROM   task_comments tc
          JOIN   tasks          t ON t.id = tc.task_id
          WHERE  t.project_id       = p.id
          AND    tc.author_role      = 'prestataire'
          AND    tc.created_at       > pv.last_viewed_at

          UNION ALL

          -- Messages discussion chantier côté prestataire
          SELECT pm.id
          FROM   project_messages pm
          WHERE  pm.project_id  = p.id
          AND    pm.author_role = 'prestataire'
          AND    pm.created_at  > pv.last_viewed_at
        ) AS activities
      )
    AS INTEGER) AS unread_count
  FROM   projects  p
  JOIN   pro_views pv ON pv.project_id = p.id AND pv.user_id = auth.uid()
  WHERE  p.user_id = auth.uid();
$$;
