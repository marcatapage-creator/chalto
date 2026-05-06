-- ─────────────────────────────────────────────────────────────────────────────
-- Dossiers administratifs
-- Sprint 1 · Mai 2026
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.admin_dossiers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL
                CHECK (type IN ('permis_construire', 'declaration_prealable', 'doc', 'daact', 'erp', 'autre')),
  label       text,
  status      text        NOT NULL DEFAULT 'en_preparation'
                CHECK (status IN ('en_preparation', 'depose', 'en_instruction', 'obtenu', 'refuse')),
  deadline    date,
  notes       text,
  -- thresholds (30, 15, 7, 1) already notified — évite les doublons du cron
  notified_thresholds int[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX admin_dossiers_project_id_idx ON public.admin_dossiers(project_id);
-- Index partiel pour le cron d'alertes (ignore les dossiers terminaux)
CREATE INDEX admin_dossiers_deadline_active_idx
  ON public.admin_dossiers(deadline)
  WHERE deadline IS NOT NULL AND status NOT IN ('obtenu', 'refuse');

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE TRIGGER admin_dossiers_updated_at
  BEFORE UPDATE ON public.admin_dossiers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.admin_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_dossiers_owner" ON public.admin_dossiers
  FOR ALL USING (user_id = auth.uid());
