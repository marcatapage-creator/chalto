-- Comptes-rendus de réunions de chantier
CREATE TABLE IF NOT EXISTS meeting_reports (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_date  date        NOT NULL DEFAULT CURRENT_DATE,
  participants  jsonb       NOT NULL DEFAULT '[]',
  notes         text,
  audio_url     text,
  transcript    text,
  report        jsonb,
  status        text        NOT NULL DEFAULT 'processing'
                            CHECK (status IN ('processing', 'ready', 'sent')),
  meeting_number int,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE meeting_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON meeting_reports
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_meeting_reports_project_id
  ON meeting_reports (project_id, created_at DESC);
