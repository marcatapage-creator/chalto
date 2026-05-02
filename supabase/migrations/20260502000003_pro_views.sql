-- Suivi des vues pro : permet d'afficher un badge "non lu" sur les projets
-- et des indicateurs par section (Documents / Tâches) dans la fiche projet.
--
-- Logique :
--   - À chaque ouverture d'un projet, on upsert last_viewed_at = now()
--   - Le badge = nb d'activités prestataire/client postérieures à last_viewed_at
--   - Activités comptées : validations (client/prestataire) + task_comments du prestataire

CREATE TABLE pro_views (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id)   ON DELETE CASCADE,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

ALTER TABLE pro_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pro_views_owner"
  ON pro_views
  FOR ALL
  USING    (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Fonction batch : unread count pour tous les projets de l'utilisateur ────
-- Utilise INNER JOIN sur pro_views → seuls les projets déjà visités ont un
-- potentiel badge (évite de tout marquer "non lu" au premier login).

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
        ) AS activities
      )
    AS INTEGER) AS unread_count
  FROM   projects  p
  JOIN   pro_views pv ON pv.project_id = p.id AND pv.user_id = auth.uid()
  WHERE  p.user_id = auth.uid();
$$;
