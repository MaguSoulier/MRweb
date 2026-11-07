-- Ejecutar UNA VEZ, despues de acceso.sql y perfil.sql: Supabase > SQL Editor > New query > pegar > Run
-- Colores de las tareas: el modo de cada persona, el color de cada proyecto/persona y el color propio de cada tarea.
-- Los colores se guardan como un numero del 1 al 8 (la paleta de la web).

-- Preferencias de color de cada persona (modo elegido y colores de estado / prioridad) y su color como persona
alter table profiles add column if not exists color text check (color is null or color ~ '^[1-8]$');
alter table profiles add column if not exists color_prefs jsonb not null default '{}'::jsonb;

-- Color de cada proyecto y de cada tarea (este ultimo se usa en el modo "Personalizado")
alter table projects add column if not exists color text check (color is null or color ~ '^[1-8]$');
alter table tasks add column if not exists color text check (color is null or color ~ '^[1-8]$');

-- Cambiar el color de cualquier persona del equipo (la politica de perfiles solo deja editar el propio perfil)
create or replace function set_profile_color(target uuid, c text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_member() then raise exception 'Sin acceso'; end if;
  if c is not null and c !~ '^[1-8]$' then raise exception 'Color no valido'; end if;
  update profiles set color = c where id = target;
end $$;

revoke all on function set_profile_color(uuid, text) from public;
grant execute on function set_profile_color(uuid, text) to authenticated;
