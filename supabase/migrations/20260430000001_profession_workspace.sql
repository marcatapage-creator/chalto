-- Ajoute l'espace de travail actif sur le profil utilisateur
alter table profiles
  add column if not exists active_profession_id uuid references professions(id);

-- Initialise à la profession courante pour tous les comptes existants
update profiles
set active_profession_id = profession_id
where profession_id is not null and active_profession_id is null;

-- Backfill profession_id sur les projets qui n'en ont pas,
-- en héritant de la profession du créateur au moment de la migration
update projects p
set profession_id = pr.profession_id
from profiles pr
where p.user_id = pr.id
  and p.profession_id is null
  and pr.profession_id is not null;
