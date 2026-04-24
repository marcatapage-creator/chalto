-- Ajoute 'commented' comme statut valide dans la table validations
-- (utilisé pour les accusés de lecture sur les documents en transmission)

ALTER TABLE public.validations
  DROP CONSTRAINT IF EXISTS validations_status_check;

ALTER TABLE public.validations
  ADD CONSTRAINT validations_status_check
  CHECK (status IN ('approved', 'rejected', 'commented'));
