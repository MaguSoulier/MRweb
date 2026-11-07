-- Ejecutar UNA VEZ (despues de colores.sql): Supabase > SQL Editor > New query > pegar > Run
-- Permite elegir cualquier color: ahora se guarda como codigo HEX (#a1744a). Los numeros 1 a 8 antiguos siguen valiendo.

alter table profiles drop constraint if exists profiles_color_check;
alter table projects drop constraint if exists projects_color_check;
alter table tasks drop constraint if exists tasks_color_check;

alter table profiles add constraint profiles_color_check check (color is null or color ~ '^(#[0-9a-fA-F]{6}|[1-8])$');
alter table projects add constraint projects_color_check check (color is null or color ~ '^(#[0-9a-fA-F]{6}|[1-8])$');
alter table tasks add constraint tasks_color_check check (color is null or color ~ '^(#[0-9a-fA-F]{6}|[1-8])$');

create or replace function set_profile_color(target uuid, c text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_member() then raise exception 'Sin acceso'; end if;
  if c is not null and c !~ '^(#[0-9a-fA-F]{6}|[1-8])$' then raise exception 'Color no valido'; end if;
  update profiles set color = c where id = target;
end $$;
