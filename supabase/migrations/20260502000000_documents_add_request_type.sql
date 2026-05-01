-- Permet au pro de choisir si l'envoi au client est pour validation ou pour information.
-- Nullable pour rétrocompatibilité : NULL sera traité comme 'validation' dans le code.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'validation';
