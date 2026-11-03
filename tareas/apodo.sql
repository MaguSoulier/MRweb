-- Ejecutar en Supabase > SQL Editor: el perfil toma el apodo elegido al crear la cuenta
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name)
  values (new.id, new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), initcap(split_part(new.email, '@', 1))))
  on conflict do nothing;
  return new;
end $$;

-- Nadie puede editar su apodo después de crear la cuenta
drop policy if exists propio on profiles;
