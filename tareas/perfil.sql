-- Ejecutar UNA VEZ: Supabase > SQL Editor > New query > pegar > Run
-- Permite que cada persona cambie su apodo y su foto de perfil (solo los suyos).

-- 1) Columna para la foto
alter table profiles add column if not exists avatar_url text;

-- 2) Cada persona puede modificar su propia fila de perfil
drop policy if exists perfil_propio on profiles;
create policy perfil_propio on profiles for update to authenticated
  using (id = auth.uid() and is_member())
  with check (id = auth.uid() and is_member());

-- 3) Espacio de almacenamiento para las fotos (público para lectura: son fotos de perfil del equipo)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do update set public = true;

drop policy if exists avatars_ver on storage.objects;
drop policy if exists avatars_subir on storage.objects;
drop policy if exists avatars_cambiar on storage.objects;
drop policy if exists avatars_borrar on storage.objects;

-- Cada persona solo escribe dentro de su carpeta (avatars/<su id>/...)
create policy avatars_ver on storage.objects for select to authenticated
  using (bucket_id = 'avatars');
create policy avatars_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and is_member());
create policy avatars_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and is_member())
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and is_member());
create policy avatars_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and is_member());
