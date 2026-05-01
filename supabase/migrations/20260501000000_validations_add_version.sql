-- Ajoute la colonne version aux validations pour lier chaque validation à la
-- version du document sur laquelle elle a été émise.
-- Nullable pour la rétrocompatibilité (validations existantes = NULL).
ALTER TABLE validations ADD COLUMN IF NOT EXISTS version INTEGER;
