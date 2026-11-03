-- Ejecutar DESPUES de schema.sql: Supabase > SQL Editor > New query > pegar > Run
-- Restringe el acceso a una lista de correos. El admin gestiona la lista.

create table if not exists allowed_emails (
  email text primary key check (email = lower(email)),
  is_admin boolean not null default false
);

insert into allowed_emails (email, is_admin) values
  ('medairesmacoop@gmail.com', true),
  ('mag.soulier01@gmail.com', false),
  ('fernandezmai03@gmail.com', false)
on conflict (email) do update set is_admin = excluded.is_admin;

-- Funciones auxiliares (security definer para poder leer la lista sin exponerla)
create or replace function is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from allowed_emails where email = lower(auth.jwt() ->> 'email'));
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from allowed_emails
                 where email = lower(auth.jwt() ->> 'email') and is_admin);
$$;

-- Bloquea el registro de correos que no estan en la lista
create or replace function check_email_allowed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from allowed_emails where email = lower(new.email)) then
    raise exception 'Este correo no tiene acceso';
  end if;
  return new;
end $$;

drop trigger if exists before_user_created on auth.users;
create trigger before_user_created before insert on auth.users
  for each row execute function check_email_allowed();

-- Permisos: solo miembros de la lista ven y editan; solo el admin gestiona la lista
alter table allowed_emails enable row level security;

drop policy if exists equipo on profiles;
drop policy if exists propio on profiles;
drop policy if exists equipo on projects;
drop policy if exists equipo on tasks;
drop policy if exists admin on allowed_emails;
drop policy if exists miembros on allowed_emails;

create policy equipo on profiles for select to authenticated using (is_member());
create policy propio on profiles for update to authenticated
  using (id = auth.uid() and is_member()) with check (id = auth.uid());
create policy equipo on projects for all to authenticated using (is_member()) with check (is_member());
create policy equipo on tasks for all to authenticated using (is_member()) with check (is_member());

create policy miembros on allowed_emails for select to authenticated using (is_member());
create policy admin on allowed_emails for all to authenticated using (is_admin()) with check (is_admin());
