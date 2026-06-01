-- Trace la lecture par prestataire pour les documents "pour information".
-- Permet de persister l'état "lu" par contributeur sans modifier le statut global du document,
-- ce qui évitait le bug où docs déjà approuvés (status=approved) ne pouvaient jamais initialiser
-- transmissionCommentSent=true côté client après rechargement.

ALTER TABLE public.document_contributors
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz DEFAULT NULL;
