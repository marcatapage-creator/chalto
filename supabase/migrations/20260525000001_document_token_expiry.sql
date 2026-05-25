-- Ajoute une date d'expiration au token de validation client.
-- Le token est renouvelé à chaque envoi (send-validation) avec une durée de 30 jours.
-- La route /api/validate rejette toute tentative après expiration (410 Gone).

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS validation_token_expires_at timestamptz DEFAULT NULL;
