-- =====================================================================
-- SIAKAD v3.0 — Storage buckets and policies
-- Run AFTER 0001_init.sql.
-- =====================================================================

-- Buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

-- =====================================================================
-- avatars bucket (public read; owner-folder write)
-- Path convention: avatars/{user_id}/avatar.{ext}
-- =====================================================================

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_own_insert on storage.objects;
create policy avatars_own_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_own_update on storage.objects;
create policy avatars_own_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_own_delete on storage.objects;
create policy avatars_own_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- materials bucket (private; signed URLs only)
-- Path convention: materials/{class_id}/{session_date}/{uuid}-{filename}
-- =====================================================================

drop policy if exists materials_obj_select on storage.objects;
create policy materials_obj_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'materials'
    and exists (
      select 1 from public.materials m
      where m.file_path = storage.objects.name
      and (
        public.is_admin()
        or m.uploaded_by_id = auth.uid()
        or (public.is_student() and m.class_id = public.auth_class_id())
        or (public.is_dosen()   and m.class_id in (
              select id from public.classes where department_id = public.auth_department_id()))
        or (public.is_head()    and m.class_id in (
              select id from public.classes where department_id = public.auth_department_id()))
      )
    )
  );

drop policy if exists materials_obj_insert on storage.objects;
create policy materials_obj_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'materials'
    and (public.is_dosen() or public.is_admin())
  );

drop policy if exists materials_obj_update on storage.objects;
create policy materials_obj_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'materials'
    and (public.is_admin() or owner = auth.uid())
  );

drop policy if exists materials_obj_delete on storage.objects;
create policy materials_obj_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'materials'
    and (public.is_admin() or owner = auth.uid())
  );
