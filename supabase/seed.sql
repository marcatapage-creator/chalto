-- Données de référence — à exécuter sur tout nouveau projet Supabase (staging, CI, local)
-- Supabase CLI : supabase db seed (lit ce fichier automatiquement)

INSERT INTO public.professions (slug, label) VALUES
  ('architecte',           'Architecte'),
  ('architecte_interieur', 'Architecte d''intérieur'),
  ('plombier',             'Plombier'),
  ('electricien',          'Électricien'),
  ('menuisier',            'Menuisier'),
  ('entrepreneur',         'Entrepreneur GC')
ON CONFLICT (slug) DO NOTHING;
