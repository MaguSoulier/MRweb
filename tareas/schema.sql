-- Pega todo este archivo en Supabase > SQL Editor > Run
-- (Si ya ejecutaste la version anterior, ejecuta antes:  drop table if exists tasks, buckets, plans cascade; )

-- Perfiles: una fila por persona, con el nombre que se muestra en la app
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text not null
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name)
  values (new.id, new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), initcap(split_part(new.email, '@', 1))))
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

insert into profiles (id, email, name)
  select id, email, initcap(split_part(email, '@', 1)) from auth.users
  on conflict do nothing;

-- Proyectos
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position double precision not null default 0, -- relevancia: cuanto menor, más importante (se define arrastrando)
  created_at timestamptz not null default now()
);
-- Si ya tenías la tabla de proyectos de una versión anterior, añade la posición
-- (y conserva el orden que daba la antigua prioridad):
alter table projects add column if not exists position double precision not null default 0;
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'projects' and column_name = 'priority') then
    update projects set position = priority * 1000;
    alter table projects drop column priority;
  end if;
end $$;

-- Tareas (varias personas pueden estar asignadas a una misma tarea)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  description text not null default '',
  assignees uuid[] not null default '{}',
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority smallint not null default 2 check (priority between 1 and 3),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- Permisos: cualquier usuario con sesion iniciada ve y edita todo (equipo pequeno de confianza)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

drop policy if exists equipo on profiles;
drop policy if exists propio on profiles;
drop policy if exists equipo on projects;
drop policy if exists equipo on tasks;
create policy equipo on profiles for select to authenticated using (true);
create policy equipo on projects for all to authenticated using (true) with check (true);
create policy equipo on tasks for all to authenticated using (true) with check (true);

-- Tiempo real
alter publication supabase_realtime add table projects, tasks, profiles;
