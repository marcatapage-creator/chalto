-- ─────────────────────────────────────────────────────────────────────────────
-- Intégrations cloud (Dropbox, Google Drive)
-- Sprint 1 · Mai 2026
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table user_integrations ───────────────────────────────────────────────────
-- Stocke les tokens OAuth par utilisateur et par provider.
-- Les tokens sont sensibles : accès limité au service role via RLS.
CREATE TABLE public.user_integrations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider              text NOT NULL CHECK (provider IN ('dropbox', 'gdrive')),
  -- Tokens chiffrés côté applicatif avant insertion (Edge Function uniquement)
  access_token          text NOT NULL,
  refresh_token         text NOT NULL,
  expires_at            timestamptz,
  -- Identifiant et email du compte cloud (affichage UI)
  provider_account_id   text,
  provider_account_email text,
  status                text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'expired', 'revoked')),
  connected_at          timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  -- Un seul compte actif par provider par utilisateur
  UNIQUE (user_id, provider)
);

-- ── Table project_cloud_links ─────────────────────────────────────────────────
-- Association dossier cloud ↔ projet. Générique pour Dropbox et GDrive.
CREATE TABLE public.project_cloud_links (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        text NOT NULL CHECK (provider IN ('dropbox', 'gdrive')),
  -- Chemin lisible (ex: /Projets/Les Cèdres/Plans)
  remote_path     text NOT NULL,
  -- ID stable du dossier dans le provider (survit aux renommages)
  remote_id       text,
  sync_enabled    boolean NOT NULL DEFAULT true,
  last_synced_at  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- Un seul lien par dossier par projet (évite les doublons)
  UNIQUE (project_id, provider, remote_path)
);

-- ── Colonnes cloud sur documents ──────────────────────────────────────────────
ALTER TABLE public.documents
  ADD COLUMN source       text NOT NULL DEFAULT 'chalto'
                            CHECK (source IN ('chalto', 'dropbox', 'gdrive')),
  -- ID stable du fichier dans le provider (pour détecter les nouvelles versions)
  ADD COLUMN cloud_file_id text;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX user_integrations_user_id_idx     ON public.user_integrations(user_id);
CREATE INDEX user_integrations_provider_idx    ON public.user_integrations(provider);
CREATE INDEX project_cloud_links_project_idx   ON public.project_cloud_links(project_id);
CREATE INDEX project_cloud_links_user_idx      ON public.project_cloud_links(user_id);
CREATE INDEX documents_source_idx              ON public.documents(source) WHERE source != 'chalto';
CREATE INDEX documents_cloud_file_id_idx       ON public.documents(cloud_file_id) WHERE cloud_file_id IS NOT NULL;

-- ── updated_at triggers ───────────────────────────────────────────────────────
CREATE TRIGGER user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER project_cloud_links_updated_at
  BEFORE UPDATE ON public.project_cloud_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_integrations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cloud_links ENABLE ROW LEVEL SECURITY;

-- user_integrations : l'utilisateur ne voit que ses propres intégrations
-- Les tokens ne sont jamais lus côté client — toutes les opérations Dropbox
-- passent par une Edge Function avec service role.
CREATE POLICY "owner_all_integrations"
  ON public.user_integrations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- project_cloud_links : seul l'architecte propriétaire du projet peut gérer ses liens
CREATE POLICY "owner_all_cloud_links"
  ON public.project_cloud_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_cloud_links.project_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_cloud_links.project_id
        AND p.user_id = auth.uid()
    )
  );
