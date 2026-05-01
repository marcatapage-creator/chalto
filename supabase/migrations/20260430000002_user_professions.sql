-- Table de jonction : un utilisateur peut avoir plusieurs professions (plan multi-métier)
create table if not exists user_professions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  profession_id uuid not null references professions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profession_id)
);

alter table user_professions enable row level security;

create policy "users can read own professions"
  on user_professions for select
  using (auth.uid() = user_id);

-- Backfill : tous les utilisateurs existants héritent de leur profession courante
insert into user_professions (user_id, profession_id)
select id, profession_id
from profiles
where profession_id is not null
on conflict do nothing;
