-- Suivi des relances clients sur les documents envoyés pour validation.
-- sent_at    : timestamptz de l'envoi initial (peuplé par send-validation)
-- reminder_count : nombre de relances déjà envoyées (plafonné à 3)
-- last_reminded_at : date de la dernière relance (pour espacer les envois)

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS sent_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminded_at timestamptz DEFAULT NULL;
