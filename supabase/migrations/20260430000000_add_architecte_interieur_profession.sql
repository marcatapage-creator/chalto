insert into professions (slug, label, description, icon)
values (
  'architecte_interieur',
  'Architecte d''intérieur',
  'Aménagement, décoration, design d''espaces intérieurs',
  'sofa'
)
on conflict (slug) do nothing;
