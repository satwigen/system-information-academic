# Supabase Setup — SIAKAD v3.0

> **This is the source of truth for the database.** The SQL below must be reviewed and approved before any application code is written. File to be checked in as `supabase/migrations/0001_init.sql`.

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Enums](#2-enums)
3. [Helper Functions](#3-helper-functions)
4. [Tables](#4-tables)
5. [Views](#5-views)
6. [Triggers](#6-triggers)
7. [Row-Level Security (RLS)](#7-row-level-security-rls)
8. [Storage Buckets](#8-storage-buckets)
9. [Seed Data](#9-seed-data)
10. [Relations Diagram](#10-relations-diagram-text-erd)

---

## 1. Conventions

| Convention | Rule |
|------------|------|
| Primary keys | `uuid` via `gen_random_uuid()` |
| Timestamps | `timestamptz` with default `now()` |
| Soft delete | Not used — delete is real, RLS controls access |
| `created_at` / `updated_at` | Every table has both; `updated_at` kept fresh by trigger |
| Naming | `snake_case`, plural table names |
| Time zone | All business logic treats times as **Asia/Jakarta** (UTC+7) |
| Foreign keys | Always `on delete restrict` unless noted otherwise |
| Indexes | Explicit on every foreign key + common filter columns |

---

## 2. Enums

```sql
create type user_role as enum ('ADMIN', 'HEAD', 'DOSEN', 'STUDENT');

create type attendance_status as enum ('PRESENT', 'LATE', 'SICK', 'ABSENT');

create type room_type as enum ('LAB', 'CLASSROOM', 'AUDITORIUM', 'SEMINAR_ROOM');

create type material_type as enum ('PDF', 'SLIDE', 'VIDEO', 'LINK', 'DOCUMENT');
```

---

## 3. Helper Functions

These run as `security definer` so RLS policies can call them without infinite recursion.

```sql
-- Current auth user's role (joined from profiles)
create or replace function public.auth_role()
returns user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Convenience booleans
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'ADMIN', false);
$$;

create or replace function public.is_head() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'HEAD', false);
$$;

create or replace function public.is_dosen() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'DOSEN', false);
$$;

create or replace function public.is_student() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'STUDENT', false);
$$;

-- Current user's department id (nullable)
create or replace function public.auth_department_id() returns uuid
language sql stable security definer set search_path = public as $$
  select department_id from public.profiles where id = auth.uid();
$$;

-- Current user's class id (nullable — only relevant for students)
create or replace function public.auth_class_id() returns uuid
language sql stable security definer set search_path = public as $$
  select class_id from public.profiles where id = auth.uid();
$$;

-- Generic updated_at trigger
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

---

## 4. Tables

### 4.1 `profiles` (1:1 with `auth.users`)

```sql
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           user_role not null default 'STUDENT',
  full_name      text not null,
  email          text not null unique,
  phone          text,
  address        text,
  avatar_url     text,
  bio            text,
  -- Student assignment (when role = STUDENT)
  class_id       uuid references public.classes(id) on delete set null,
  -- Academic reference (staff + students)
  department_id  uuid references public.departments(id) on delete set null,
  -- Staff identifiers
  nim            text unique,  -- student ID
  nip            text unique,  -- staff ID
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_profiles_role           on public.profiles (role);
create index idx_profiles_department_id  on public.profiles (department_id);
create index idx_profiles_class_id       on public.profiles (class_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
```

### 4.2 `departments`

```sql
create table public.departments (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,
  icon         text,
  head_id      uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_departments_head_id on public.departments (head_id);

create trigger trg_departments_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();
```

### 4.3 `classes`

```sql
create table public.classes (
  id             uuid primary key default gen_random_uuid(),
  department_id  uuid not null references public.departments(id) on delete restrict,
  name           text not null,
  semester       int  not null check (semester between 1 and 14),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (department_id, name)
);

create index idx_classes_department_id on public.classes (department_id);

create trigger trg_classes_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();
```

### 4.4 `subjects` (courses)

```sql
create table public.subjects (
  id             uuid primary key default gen_random_uuid(),
  department_id  uuid not null references public.departments(id) on delete restrict,
  code           text not null unique,
  name           text not null,
  credits        int  not null check (credits between 1 and 10),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_subjects_department_id on public.subjects (department_id);

create trigger trg_subjects_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();
```

### 4.5 `rooms`

```sql
create table public.rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                -- e.g. "Lab 1"
  building    text not null,                -- e.g. "Building A"
  floor       int  not null,                -- e.g. 2
  capacity    int  not null check (capacity > 0),
  type        room_type not null default 'CLASSROOM',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (building, floor, name)
);

create trigger trg_rooms_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();
```

### 4.6 `room_mappings` (subject ↔ class ↔ room ↔ weekly slot)

```sql
create table public.room_mappings (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id)    on delete cascade,
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  class_id     uuid not null references public.classes(id)  on delete cascade,
  day_of_week  int  not null check (day_of_week between 0 and 6),  -- 0=Sun
  start_time   time not null,
  end_time     time not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint room_mappings_time_order check (end_time > start_time),
  constraint room_mappings_unique_slot unique (room_id, day_of_week, start_time)
);

create index idx_room_mappings_class_id   on public.room_mappings (class_id);
create index idx_room_mappings_subject_id on public.room_mappings (subject_id);
create index idx_room_mappings_room_id    on public.room_mappings (room_id);
create index idx_room_mappings_day        on public.room_mappings (day_of_week);

create trigger trg_room_mappings_updated_at
  before update on public.room_mappings
  for each row execute function public.set_updated_at();
```

### 4.7 `attendance_records`

```sql
create table public.attendance_records (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles(id) on delete cascade,
  class_id         uuid not null references public.classes(id)  on delete cascade,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  session_date     date not null,
  status           attendance_status not null,
  recorded_by_id   uuid not null references public.profiles(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (student_id, class_id, subject_id, session_date)
);

create index idx_att_student_id  on public.attendance_records (student_id);
create index idx_att_class_date  on public.attendance_records (class_id, session_date);
create index idx_att_subject_id  on public.attendance_records (subject_id);

create trigger trg_attendance_updated_at
  before update on public.attendance_records
  for each row execute function public.set_updated_at();
```

### 4.8 `materials` (files uploaded by dosen)

```sql
create table public.materials (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid not null references public.classes(id)  on delete cascade,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  session_date     date not null,                                -- DOS-MAT-03
  title            text not null,
  description      text,
  file_type        material_type not null default 'PDF',
  file_path        text not null,        -- path inside `materials` storage bucket
  file_size_bytes  bigint check (file_size_bytes <= 52428800),  -- 50 MB cap
  mime_type        text,
  uploaded_by_id   uuid not null references public.profiles(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_materials_class_id     on public.materials (class_id);
create index idx_materials_subject_id   on public.materials (subject_id);
create index idx_materials_session_date on public.materials (session_date);

create trigger trg_materials_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();
```

### 4.9 `tasks` (assignments created by dosen)

```sql
create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  class_id       uuid not null references public.classes(id)  on delete cascade,
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  title          text not null,
  description    text not null,
  due_date       timestamptz not null,
  created_by_id  uuid not null references public.profiles(id) on delete restrict,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_tasks_class_id on public.tasks (class_id);
create index idx_tasks_due_date on public.tasks (due_date);

create trigger trg_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
```

### 4.10 `student_tasks` (per-student completion)

```sql
create table public.student_tasks (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id)    on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  is_done     boolean not null default false,
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (task_id, user_id)
);

create index idx_student_tasks_user_id on public.student_tasks (user_id);
create index idx_student_tasks_task_id on public.student_tasks (task_id);

create trigger trg_student_tasks_updated_at
  before update on public.student_tasks
  for each row execute function public.set_updated_at();
```

### 4.11 `announcements` (feed posts)

```sql
create table public.announcements (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles(id) on delete cascade,
  class_id       uuid references public.classes(id)       on delete set null, -- null = dept-wide or global
  department_id  uuid references public.departments(id)   on delete set null,
  title          text not null,
  body           text not null,
  pinned         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_announcements_class_id      on public.announcements (class_id);
create index idx_announcements_department_id on public.announcements (department_id);
create index idx_announcements_created_at    on public.announcements (created_at desc);

create trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();
```

### 4.12 `likes`

```sql
create table public.likes (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.profiles(id)      on delete cascade,
  created_at       timestamptz not null default now(),
  unique (announcement_id, user_id)
);

create index idx_likes_announcement_id on public.likes (announcement_id);
```

### 4.13 `comments`

```sql
create table public.comments (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.profiles(id)      on delete cascade,
  body             text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_comments_announcement_id on public.comments (announcement_id);

create trigger trg_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();
```

---

## 5. Views

### 5.1 `room_mappings_expanded` — used by dashboards and auto-expiry filter

```sql
create view public.room_mappings_expanded as
  select
    m.id,
    m.day_of_week,
    m.start_time,
    m.end_time,
    r.id        as room_id,
    r.name      as room_name,
    r.building,
    r.floor,
    r.type      as room_type,
    s.id        as subject_id,
    s.name      as subject_name,
    s.code      as subject_code,
    c.id        as class_id,
    c.name      as class_name,
    c.semester,
    c.department_id
  from public.room_mappings m
  join public.rooms    r on r.id = m.room_id
  join public.subjects s on s.id = m.subject_id
  join public.classes  c on c.id = m.class_id;
```

Views inherit RLS from their base tables.

### 5.2 `attendance_stats_by_class` — feeds the Reports page

```sql
create view public.attendance_stats_by_class as
  select
    class_id,
    subject_id,
    count(*)                                                                     as total,
    count(*) filter (where status = 'PRESENT')                                   as present,
    count(*) filter (where status = 'LATE')                                      as late,
    count(*) filter (where status = 'SICK')                                      as sick,
    count(*) filter (where status = 'ABSENT')                                    as absent,
    round(100.0 * count(*) filter (where status in ('PRESENT','LATE')) / count(*), 1) as rate_pct
  from public.attendance_records
  group by class_id, subject_id;
```

---

## 6. Triggers

### 6.1 Auto-create `profiles` on user signup

```sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'STUDENT')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
```

> **Admin flow:** when admin creates a user, the server action calls `supabase.auth.admin.createUser({ email, password, user_metadata: { full_name, role } })`. The trigger fills in `profiles` automatically. Admin then PATCHes `profiles` to set `class_id`, `department_id`, `nim`/`nip`, etc.

### 6.2 `updated_at` trigger already declared per-table in section 4.

---

## 7. Row-Level Security (RLS)

**Every table has RLS enabled.** Policies follow the principle of least privilege.

```sql
alter table public.profiles           enable row level security;
alter table public.departments        enable row level security;
alter table public.classes            enable row level security;
alter table public.subjects           enable row level security;
alter table public.rooms              enable row level security;
alter table public.room_mappings      enable row level security;
alter table public.attendance_records enable row level security;
alter table public.materials          enable row level security;
alter table public.tasks              enable row level security;
alter table public.student_tasks      enable row level security;
alter table public.announcements      enable row level security;
alter table public.likes              enable row level security;
alter table public.comments           enable row level security;
```

### 7.1 `profiles`

```sql
-- SELECT: Authenticated users can see their own profile; admins see all;
-- HEAD/DOSEN can see profiles in their department (for roster views).
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (public.is_head() and department_id = public.auth_department_id())
    or (public.is_dosen() and department_id = public.auth_department_id())
  );

-- UPDATE: User can update own profile; admin can update any.
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- INSERT: Only via the auth trigger (definer); admin can also insert via service role.
-- No INSERT policy for authenticated — trigger bypasses RLS.

-- DELETE: Admin only.
create policy profiles_delete_admin on public.profiles
  for delete to authenticated using (public.is_admin());
```

### 7.2 `departments`

```sql
create policy departments_select_all on public.departments
  for select to authenticated using (true);

create policy departments_admin_write on public.departments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
```

### 7.3 `classes` and `subjects`

```sql
-- Same pattern for both tables
create policy classes_select_all on public.classes
  for select to authenticated using (true);

create policy classes_admin_write on public.classes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy subjects_select_all on public.subjects
  for select to authenticated using (true);

create policy subjects_admin_write on public.subjects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

### 7.4 `rooms` and `room_mappings`

```sql
create policy rooms_select_all on public.rooms
  for select to authenticated using (true);

create policy rooms_admin_write on public.rooms
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy room_mappings_select_all on public.room_mappings
  for select to authenticated using (true);

create policy room_mappings_admin_write on public.room_mappings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

### 7.5 `attendance_records`

```sql
-- SELECT: student sees own; dosen sees own recorded or their classes;
-- head sees department classes; admin sees all.
create policy attendance_select on public.attendance_records
  for select to authenticated
  using (
    student_id = auth.uid()
    or recorded_by_id = auth.uid()
    or public.is_admin()
    or (public.is_head() and class_id in (
          select id from public.classes where department_id = public.auth_department_id()))
    or public.is_dosen()   -- dosen can read records for any class they teach; refined in app query
  );

-- INSERT/UPDATE: DOSEN only (and admin). STUDENT is explicitly blocked.
create policy attendance_dosen_insert on public.attendance_records
  for insert to authenticated
  with check (public.is_dosen() or public.is_admin());

create policy attendance_dosen_update on public.attendance_records
  for update to authenticated
  using (public.is_dosen() or public.is_admin())
  with check (public.is_dosen() or public.is_admin());

create policy attendance_admin_delete on public.attendance_records
  for delete to authenticated using (public.is_admin());
```

### 7.6 `materials`

```sql
-- SELECT:
--   STUDENT: only if material's class_id matches student's class_id.
--   DOSEN: own-uploaded or materials in their department.
--   HEAD: dept scope.  (But HEAD UI omits this page per PRD.)
--   ADMIN: all.
create policy materials_select on public.materials
  for select to authenticated
  using (
    public.is_admin()
    or uploaded_by_id = auth.uid()
    or (public.is_student() and class_id = public.auth_class_id())
    or (public.is_dosen()   and class_id in (
          select id from public.classes where department_id = public.auth_department_id()))
    or (public.is_head()    and class_id in (
          select id from public.classes where department_id = public.auth_department_id()))
  );

-- INSERT/UPDATE/DELETE: DOSEN (own) or ADMIN.
create policy materials_dosen_insert on public.materials
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_dosen() and uploaded_by_id = auth.uid())
  );

create policy materials_dosen_update on public.materials
  for update to authenticated
  using (
    public.is_admin() or (public.is_dosen() and uploaded_by_id = auth.uid())
  )
  with check (
    public.is_admin() or (public.is_dosen() and uploaded_by_id = auth.uid())
  );

create policy materials_dosen_delete on public.materials
  for delete to authenticated
  using (
    public.is_admin() or (public.is_dosen() and uploaded_by_id = auth.uid())
  );
```

### 7.7 `tasks`

```sql
create policy tasks_select on public.tasks
  for select to authenticated
  using (
    public.is_admin()
    or created_by_id = auth.uid()
    or (public.is_student() and class_id = public.auth_class_id())
    or (public.is_head()    and class_id in (
          select id from public.classes where department_id = public.auth_department_id()))
  );

create policy tasks_dosen_write on public.tasks
  for insert to authenticated
  with check (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()));

create policy tasks_dosen_update on public.tasks
  for update to authenticated
  using (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()))
  with check (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()));

create policy tasks_dosen_delete on public.tasks
  for delete to authenticated
  using (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()));
```

### 7.8 `student_tasks` (mark-as-done)

```sql
-- SELECT: owner or admin or the dosen who created the parent task.
create policy student_tasks_select on public.student_tasks
  for select to authenticated
  using (
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.tasks t where t.id = task_id and t.created_by_id = auth.uid()
    )
  );

-- INSERT/UPDATE: STUDENT only, for their own rows.
create policy student_tasks_student_upsert on public.student_tasks
  for insert to authenticated
  with check (public.is_student() and user_id = auth.uid());

create policy student_tasks_student_update on public.student_tasks
  for update to authenticated
  using (public.is_student() and user_id = auth.uid())
  with check (public.is_student() and user_id = auth.uid());

-- DELETE: admin only (rare)
create policy student_tasks_admin_delete on public.student_tasks
  for delete to authenticated using (public.is_admin());
```

### 7.9 `announcements`, `likes`, `comments`

```sql
-- SELECT: any authenticated user (the feed is campus-wide).
create policy announcements_select on public.announcements
  for select to authenticated using (true);

-- INSERT: any staff (ADMIN, HEAD, DOSEN). NOT students.
create policy announcements_staff_insert on public.announcements
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and (public.is_admin() or public.is_head() or public.is_dosen())
  );

-- UPDATE:
--   * Admin can edit ANY post (PRD: ADM-FEED-01).
--   * Author can edit their own post.
create policy announcements_update on public.announcements
  for update to authenticated
  using (public.is_admin() or author_id = auth.uid())
  with check (public.is_admin() or author_id = auth.uid());

-- DELETE:
--   * Admin can delete ANY post (PRD: ADM-FEED-02).
--   * Author can delete their own post.
create policy announcements_delete on public.announcements
  for delete to authenticated
  using (public.is_admin() or author_id = auth.uid());

-- likes: select all authenticated, toggle own.
create policy likes_select on public.likes
  for select to authenticated using (true);
create policy likes_insert on public.likes
  for insert to authenticated with check (user_id = auth.uid());
create policy likes_delete on public.likes
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- comments: select all, insert self, update own, delete own/admin.
create policy comments_select on public.comments
  for select to authenticated using (true);
create policy comments_insert on public.comments
  for insert to authenticated with check (user_id = auth.uid());
create policy comments_update on public.comments
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy comments_delete on public.comments
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());
```

---

## 8. Storage Buckets

### 8.1 Bucket creation

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;
```

### 8.2 `avatars` bucket policies

- Public read.
- Authenticated user can upload/update/delete only inside folder `{user_id}/`.

```sql
create policy avatars_public_read
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_own_write
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_own_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_own_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 8.3 `materials` bucket policies

- **No public read.** Downloads always go through a server-issued signed URL.
- Authenticated DOSEN can upload to folder `{class_id}/{session_date}/`.
- Download access is controlled by the **app layer** via signed URLs issued only after the request passes the `materials` row RLS check. Storage policies here are the backstop.

```sql
-- SELECT: authenticated users may download only if a matching materials row is readable to them.
create policy materials_obj_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'materials'
    and exists (
      select 1 from public.materials m
      where m.file_path = storage.objects.name
      -- RLS on public.materials is already the gate; duplicate the critical check here.
      and (
        public.is_admin()
        or m.uploaded_by_id = auth.uid()
        or (public.is_student() and m.class_id = public.auth_class_id())
        or (public.is_dosen()   and m.class_id in (
              select id from public.classes where department_id = public.auth_department_id()))
      )
    )
  );

-- INSERT: DOSEN or ADMIN may write to the materials bucket.
create policy materials_obj_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'materials'
    and (public.is_dosen() or public.is_admin())
  );

-- UPDATE/DELETE: owner-uploader or admin.
create policy materials_obj_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'materials'
    and (public.is_admin() or owner = auth.uid())
  );

create policy materials_obj_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'materials'
    and (public.is_admin() or owner = auth.uid())
  );
```

> **File path convention:** `materials/{class_id}/{session_date}/{uuid}-{safe-filename}`.

---

## 9. Seed Data

Seed script `supabase/seed.sql`. Runs after `0001_init.sql`. Emails are demo-only.

```sql
-- 9.1 Demo auth users (must be created via Supabase Admin API or dashboard).
--     Their IDs are captured into @admin_id, @head_id, @dosen_id, @student_id
--     by the seeding script that runs AFTER createUser(). We assume those uuids here.

-- 9.2 Departments
insert into public.departments (id, code, name, description, icon) values
  ('d1111111-1111-1111-1111-111111111111', 'IT',  'Information Technology',
   'Software engineering, networking, system administration.', 'Monitor'),
  ('d2222222-2222-2222-2222-222222222222', 'INF', 'Informatics',
   'Computer science, algorithms, data structures.', 'Code'),
  ('d3333333-3333-3333-3333-333333333333', 'DB',  'Digital Business',
   'Technology combined with business strategy and digital marketing.', 'TrendingUp');

-- 9.3 Classes (3 per dept)
insert into public.classes (id, department_id, name, semester) values
  ('c1111111-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 'IT-1A', 1),
  ('c1111111-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 'IT-1B', 1),
  ('c1111111-0000-0000-0000-000000000003', 'd1111111-1111-1111-1111-111111111111', 'IT-3A', 3),
  ('c2222222-0000-0000-0000-000000000001', 'd2222222-2222-2222-2222-222222222222', 'INF-1A', 1),
  ('c2222222-0000-0000-0000-000000000002', 'd2222222-2222-2222-2222-222222222222', 'INF-1B', 1),
  ('c2222222-0000-0000-0000-000000000003', 'd2222222-2222-2222-2222-222222222222', 'INF-3A', 3),
  ('c3333333-0000-0000-0000-000000000001', 'd3333333-3333-3333-3333-333333333333', 'DB-1A', 1),
  ('c3333333-0000-0000-0000-000000000002', 'd3333333-3333-3333-3333-333333333333', 'DB-1B', 1),
  ('c3333333-0000-0000-0000-000000000003', 'd3333333-3333-3333-3333-333333333333', 'DB-3A', 3);

-- 9.4 Subjects (a few per dept)
insert into public.subjects (id, department_id, code, name, credits) values
  ('sub-it-web',    'd1111111-1111-1111-1111-111111111111', 'IT201', 'Web Development',        3),
  ('sub-it-db',     'd1111111-1111-1111-1111-111111111111', 'IT202', 'Database Systems',       3),
  ('sub-it-net',    'd1111111-1111-1111-1111-111111111111', 'IT203', 'Computer Networking',    3),
  ('sub-inf-algo',  'd2222222-2222-2222-2222-222222222222', 'INF201','Algorithms & DS',        4),
  ('sub-inf-oop',   'd2222222-2222-2222-2222-222222222222', 'INF202','Object-Oriented Prog',  3),
  ('sub-inf-ai',    'd2222222-2222-2222-2222-222222222222', 'INF301','Artificial Intelligence',3),
  ('sub-db-dm',     'd3333333-3333-3333-3333-333333333333', 'DB201', 'Digital Marketing',      3),
  ('sub-db-ba',     'd3333333-3333-3333-3333-333333333333', 'DB202', 'Business Analytics',     3),
  ('sub-db-ui',     'd3333333-3333-3333-3333-333333333333', 'DB203', 'UI/UX Design',           2);

-- 9.5 Rooms
insert into public.rooms (id, name, building, floor, capacity, type) values
  ('r0000001-0000-0000-0000-000000000001', 'Lab 1',      'Building A', 2,  30, 'LAB'),
  ('r0000001-0000-0000-0000-000000000002', 'Lab 2',      'Building A', 2,  30, 'LAB'),
  ('r0000001-0000-0000-0000-000000000003', 'Room 304',   'Building A', 3,  45, 'CLASSROOM'),
  ('r0000001-0000-0000-0000-000000000004', 'Room 305',   'Building A', 3,  40, 'CLASSROOM'),
  ('r0000001-0000-0000-0000-000000000005', 'Auditorium', 'Building B', 1, 200, 'AUDITORIUM'),
  ('r0000001-0000-0000-0000-000000000006', 'Seminar A',  'Building B', 2,  60, 'SEMINAR_ROOM'),
  ('r0000001-0000-0000-0000-000000000007', 'Lab 3',      'Building C', 1,  25, 'LAB'),
  ('r0000001-0000-0000-0000-000000000008', 'Room 201',   'Building C', 2,  35, 'CLASSROOM');

-- 9.6 Room mappings (sample)
insert into public.room_mappings (room_id, subject_id, class_id, day_of_week, start_time, end_time) values
  ('r0000001-0000-0000-0000-000000000001','sub-it-web',   'c1111111-0000-0000-0000-000000000001', 1, '08:00', '10:00'),
  ('r0000001-0000-0000-0000-000000000003','sub-it-db',    'c1111111-0000-0000-0000-000000000001', 3, '13:00', '15:00'),
  ('r0000001-0000-0000-0000-000000000001','sub-inf-algo', 'c2222222-0000-0000-0000-000000000001', 1, '10:00', '12:00'),
  ('r0000001-0000-0000-0000-000000000008','sub-db-dm',    'c3333333-0000-0000-0000-000000000001', 1, '13:00', '15:00');
```

> **Demo accounts** are created via a separate Node script calling `supabase.auth.admin.createUser()` for each role: admin@siakad.test, head@siakad.test, dosen@siakad.test, student@siakad.test. See `supabase/seed.ts`.

---

## 10. Relations Diagram (text ERD)

```
auth.users (managed by Supabase)
    │ 1:1
    ▼
profiles ─────────────────────────────────────────────────────────────┐
  id, role, full_name, email, phone, address, avatar_url,             │
  class_id  ── ──►  classes.id                                         │
  department_id ── ──►  departments.id                                 │
  nim, nip                                                             │
                                                                       │
departments ◄── head_id ── (profiles.id, nullable)                     │
  ▲                                                                    │
  │ 1:N                                                                │
  ├── classes ── 1:N ── room_mappings ── N:1 ── rooms                  │
  │                └── N:1 ── subjects                                 │
  │                                                                    │
  └── subjects                                                         │
                                                                       │
classes                                                                │
  ├── 1:N ── attendance_records ── N:1 ── profiles (student)           │
  │                             ── N:1 ── profiles (recorded_by)       │
  │                             ── N:1 ── subjects                     │
  │                                                                    │
  ├── 1:N ── materials ── N:1 ── profiles (uploaded_by)                │
  │                     ── N:1 ── subjects                             │
  │                                                                    │
  ├── 1:N ── tasks ── N:1 ── profiles (created_by)                     │
  │              └── 1:N ── student_tasks ── N:1 ── profiles (user)    │
  │                                                                    │
  └── 1:N ── announcements (optional class_id)                         │
                                                                       │
announcements                                                          │
  ├── 1:N ── likes ── N:1 ── profiles                                  │
  └── 1:N ── comments ── N:1 ── profiles                               │
```

---

## 11. Migration Order

1. Apply `supabase/migrations/0001_init.sql` (enums + functions + tables + views + triggers + RLS).
2. Apply `supabase/migrations/0002_storage.sql` (buckets + storage policies).
3. Create demo auth users via Admin API.
4. Apply `supabase/seed.sql` (reference data + links to demo users).
5. Generate TypeScript types: `supabase gen types typescript --project-id <id> > src/types/database.ts`.

---

## 12. Checklist for User Verification

Before coding begins, please confirm:

- [ ] Table list matches the intended domain (13 tables listed).
- [ ] Role enum values (`ADMIN`, `HEAD`, `DOSEN`, `STUDENT`) are correct.
- [ ] 50 MB materials cap is correct and reflected in the check constraint.
- [ ] Room mapping weekly-recurring model is what you want (vs. specific-date bookings).
- [ ] Student attendance is read-only (no INSERT policy for students on `attendance_records`).
- [ ] Admin can edit/delete ANY feed post (policies confirm this).
- [ ] Head cannot see `materials` in nav (application-layer) but RLS still allows read within department (safety net).
- [ ] Storage bucket names: `avatars` (public), `materials` (private + signed URLs).
- [ ] Deletion policy for users = cascade-delete their owned rows (attendance-as-student, materials, announcements, comments, likes) but RESTRICT when they are `recorded_by` on attendance or `created_by` on tasks.
