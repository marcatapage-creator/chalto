-- Assure que les utilisateurs peuvent mettre à jour active_profession_id sur leur propre profil.
-- On drop/recreate la policy update si elle existe, sinon on en crée une nouvelle.
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "users can update own profile" on profiles;

create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
