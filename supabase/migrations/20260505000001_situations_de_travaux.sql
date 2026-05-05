-- ─────────────────────────────────────────────────────────────────────────────
-- Situations de travaux
-- Sprint 1 · Mai 2026
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table situations ─────────────────────────────────────────────────────────
CREATE TABLE public.situations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contributor_id        uuid NOT NULL REFERENCES public.contributors(id) ON DELETE CASCADE,
  -- Lot de travaux (texte libre en MVP)
  lot_label             text NOT NULL,
  -- Avancement déclaré (0-100)
  percentage            smallint NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  -- Montant HT optionnel (saisi libre, pas calculé en MVP)
  amount_ht             numeric(12, 2),
  -- Commentaire libre du prestataire
  comment               text,
  -- Workflow : en_attente → validee | refusee ; refusee → corrigee (nouvelle ligne)
  status                text NOT NULL DEFAULT 'en_attente'
                          CHECK (status IN ('en_attente', 'validee', 'refusee', 'corrigee')),
  -- Motif de refus (obligatoire si status = refusee)
  refusal_reason        text,
  -- Commentaire de l'architecte lors de la validation/refus
  reviewer_comment      text,
  -- Pour tracer les corrections : pointe vers la situation refusée précédente
  parent_situation_id   uuid REFERENCES public.situations(id),
  -- Qui a validé/refusé (user_id de l'architecte)
  reviewed_by           uuid REFERENCES auth.users(id),
  submitted_at          timestamptz NOT NULL DEFAULT now(),
  reviewed_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ── Table situation_attachments ───────────────────────────────────────────────
CREATE TABLE public.situation_attachments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id   uuid NOT NULL REFERENCES public.situations(id) ON DELETE CASCADE,
  type           text NOT NULL CHECK (type IN ('photo', 'document')),
  url            text NOT NULL,
  file_name      text,
  file_size      bigint,
  file_type      text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX situations_project_id_idx       ON public.situations(project_id);
CREATE INDEX situations_contributor_id_idx   ON public.situations(contributor_id);
CREATE INDEX situations_status_idx           ON public.situations(status);
CREATE INDEX situations_parent_idx           ON public.situations(parent_situation_id) WHERE parent_situation_id IS NOT NULL;
CREATE INDEX situation_attachments_sit_idx   ON public.situation_attachments(situation_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER situations_updated_at
  BEFORE UPDATE ON public.situations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.situations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situation_attachments ENABLE ROW LEVEL SECURITY;

-- Situations : architecte = propriétaire du projet
CREATE POLICY "architecte_all_situations"
  ON public.situations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = situations.project_id
        AND p.user_id = auth.uid()
    )
  );

-- Situations : prestataire voit et crée uniquement ses propres situations
CREATE POLICY "contributor_own_situations_select"
  ON public.situations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE c.id = situations.contributor_id
        AND c.invite_token IS NOT NULL
        -- La vérification du token se fait côté applicatif (Route Handler)
    )
  );

CREATE POLICY "contributor_insert_situation"
  ON public.situations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contributors c
      WHERE c.id = situations.contributor_id
        AND c.invite_token IS NOT NULL
    )
  );

-- Pièces jointes : héritent des droits de la situation parente
CREATE POLICY "architecte_all_attachments"
  ON public.situation_attachments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.situations s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = situation_attachments.situation_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "contributor_own_attachments_select"
  ON public.situation_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.situations s
      JOIN public.contributors c ON c.id = s.contributor_id
      WHERE s.id = situation_attachments.situation_id
        AND c.invite_token IS NOT NULL
    )
  );

CREATE POLICY "contributor_insert_attachment"
  ON public.situation_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.situations s
      JOIN public.contributors c ON c.id = s.contributor_id
      WHERE s.id = situation_attachments.situation_id
        AND c.invite_token IS NOT NULL
    )
  );

-- ── Storage bucket situations ─────────────────────────────────────────────────
-- À créer dans Supabase Dashboard ou via CLI :
-- supabase storage create situations --public
-- Les fichiers sont stockés sous : situations/{project_id}/{situation_id}/{filename}
