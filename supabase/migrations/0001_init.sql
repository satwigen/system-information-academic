-- =====================================================================
-- SIAKAD v3.0 — Initial schema
-- Run this in Supabase SQL editor (or: supabase db push).
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =====================================================================
-- ENUMS
-- =====================================================================

do $$ begin
  create type public.user_role as enum ('ADMIN', 'HEAD', 'DOSEN', 'STUDENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('PRESENT', 'LATE', 'SICK', 'ABSENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.room_type as enum ('LAB', 'CLASSROOM', 'AUDITORIUM', 'SEMINAR_ROOM');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.material_type as enum ('PDF', 'SLIDE', 'VIDEO', 'LINK', 'DOCUMENT');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- HELPER FUNCTIONS (security definer so they bypass RLS for their reads)
-- =====================================================================

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.auth_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

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

create or replace function public.auth_department_id() returns uuid
language sql stable security definer set search_path = public as $$
  select department_id from public.profiles where id = auth.uid();
$$;

create or replace function public.auth_class_id() returns uuid
language sql stable security definer set search_path = public as $$
  select class_id from public.profiles where id = auth.uid();
$$;

-- =====================================================================
-- TABLES
-- =====================================================================

-- -------- departments (defined before profiles so FK works) --------
create table if not exists public.departments (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,
  icon         text,
  head_id      uuid,  -- FK added later (circular with profiles)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -------- classes --------
create table if not exists public.classes (
  id             uuid primary key default gen_random_uuid(),
  department_id  uuid not null references public.departments(id) on delete restrict,
  name           text not null,
  semester       int  not null check (semester between 1 and 14),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (department_id, name)
);
create index if not exists idx_classes_department_id on public.classes (department_id);

-- -------- subjects (courses) --------
create table if not exists public.subjects (
  id             uuid primary key default gen_random_uuid(),
  department_id  uuid not null references public.departments(id) on delete restrict,
  code           text not null unique,
  name           text not null,
  credits        int  not null check (credits between 1 and 10),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_subjects_department_id on public.subjects (department_id);

-- -------- profiles (1:1 with auth.users) --------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           public.user_role not null default 'STUDENT',
  full_name      text not null,
  email          text not null unique,
  phone          text,
  address        text,
  avatar_url     text,
  bio            text,
  class_id       uuid references public.classes(id) on delete set null,
  department_id  uuid references public.departments(id) on delete set null,
  nim            text unique,
  nip            text unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_profiles_role          on public.profiles (role);
create index if not exists idx_profiles_department_id on public.profiles (department_id);
create index if not exists idx_profiles_class_id      on public.profiles (class_id);

-- Add the deferred FK from departments.head_id -> profiles.id
do $$ begin
  alter table public.departments
    add constraint departments_head_fk foreign key (head_id)
    references public.profiles(id) on delete set null;
exception when duplicate_object then null; end $$;
create index if not exists idx_departments_head_id on public.departments (head_id);

-- -------- rooms --------
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  building    text not null,
  floor       int  not null,
  capacity    int  not null check (capacity > 0),
  type        public.room_type not null default 'CLASSROOM',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (building, floor, name)
);

-- -------- room_mappings --------
create table if not exists public.room_mappings (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.rooms(id)    on delete cascade,
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  class_id     uuid not null references public.classes(id)  on delete cascade,
  day_of_week  int  not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint room_mappings_time_order check (end_time > start_time),
  constraint room_mappings_unique_slot unique (room_id, day_of_week, start_time)
);
create index if not exists idx_room_mappings_class_id   on public.room_mappings (class_id);
create index if not exists idx_room_mappings_subject_id on public.room_mappings (subject_id);
create index if not exists idx_room_mappings_room_id    on public.room_mappings (room_id);
create index if not exists idx_room_mappings_day        on public.room_mappings (day_of_week);

-- -------- attendance_records --------
create table if not exists public.attendance_records (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles(id) on delete cascade,
  class_id         uuid not null references public.classes(id)  on delete cascade,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  session_date     date not null,
  status           public.attendance_status not null,
  recorded_by_id   uuid not null references public.profiles(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (student_id, class_id, subject_id, session_date)
);
create index if not exists idx_att_student_id  on public.attendance_records (student_id);
create index if not exists idx_att_class_date  on public.attendance_records (class_id, session_date);
create index if not exists idx_att_subject_id  on public.attendance_records (subject_id);

-- -------- materials --------
create table if not exists public.materials (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid not null references public.classes(id)  on delete cascade,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  session_date     date not null,
  title            text not null,
  description      text,
  file_type        public.material_type not null default 'PDF',
  file_path        text not null,
  file_size_bytes  bigint check (file_size_bytes <= 52428800),  -- 50 MB
  mime_type        text,
  uploaded_by_id   uuid not null references public.profiles(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_materials_class_id     on public.materials (class_id);
create index if not exists idx_materials_subject_id   on public.materials (subject_id);
create index if not exists idx_materials_session_date on public.materials (session_date);

-- -------- tasks --------
create table if not exists public.tasks (
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
create index if not exists idx_tasks_class_id on public.tasks (class_id);
create index if not exists idx_tasks_due_date on public.tasks (due_date);

-- -------- student_tasks --------
create table if not exists public.student_tasks (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id)    on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  is_done     boolean not null default false,
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (task_id, user_id)
);
create index if not exists idx_student_tasks_user_id on public.student_tasks (user_id);
create index if not exists idx_student_tasks_task_id on public.student_tasks (task_id);

-- -------- announcements --------
create table if not exists public.announcements (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles(id) on delete cascade,
  class_id       uuid references public.classes(id)       on delete set null,
  department_id  uuid references public.departments(id)   on delete set null,
  title          text not null,
  body           text not null,
  pinned         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_announcements_class_id      on public.announcements (class_id);
create index if not exists idx_announcements_department_id on public.announcements (department_id);
create index if not exists idx_announcements_created_at    on public.announcements (created_at desc);

-- -------- likes --------
create table if not exists public.likes (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.profiles(id)      on delete cascade,
  created_at       timestamptz not null default now(),
  unique (announcement_id, user_id)
);
create index if not exists idx_likes_announcement_id on public.likes (announcement_id);

-- -------- comments --------
create table if not exists public.comments (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.profiles(id)      on delete cascade,
  body             text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_comments_announcement_id on public.comments (announcement_id);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- updated_at triggers
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at before update on public.departments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at before update on public.classes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subjects_updated_at on public.subjects;
create trigger trg_subjects_updated_at before update on public.subjects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at before update on public.rooms
  for each row execute function public.set_updated_at();

drop trigger if exists trg_room_mappings_updated_at on public.room_mappings;
create trigger trg_room_mappings_updated_at before update on public.room_mappings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_attendance_updated_at on public.attendance_records;
create trigger trg_attendance_updated_at before update on public.attendance_records
  for each row execute function public.set_updated_at();

drop trigger if exists trg_materials_updated_at on public.materials;
create trigger trg_materials_updated_at before update on public.materials
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists trg_student_tasks_updated_at on public.student_tasks;
create trigger trg_student_tasks_updated_at before update on public.student_tasks
  for each row execute function public.set_updated_at();

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

-- Auto-create profiles row on auth.users insert.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'STUDENT')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- =====================================================================
-- VIEWS
-- =====================================================================

create or replace view public.room_mappings_expanded as
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

create or replace view public.attendance_stats_by_class as
  select
    class_id,
    subject_id,
    count(*)                                                                                  as total,
    count(*) filter (where status = 'PRESENT')                                                as present,
    count(*) filter (where status = 'LATE')                                                   as late,
    count(*) filter (where status = 'SICK')                                                   as sick,
    count(*) filter (where status = 'ABSENT')                                                 as absent,
    round(100.0 * count(*) filter (where status in ('PRESENT','LATE')) / count(*), 1)         as rate_pct
  from public.attendance_records
  group by class_id, subject_id;

-- =====================================================================
-- RLS
-- =====================================================================

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

-- -------- profiles --------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (public.is_head()  and department_id = public.auth_department_id())
    or (public.is_dosen() and department_id = public.auth_department_id())
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated using (public.is_admin());

-- -------- departments --------
drop policy if exists departments_select on public.departments;
create policy departments_select on public.departments for select to authenticated using (true);
drop policy if exists departments_admin_write on public.departments;
create policy departments_admin_write on public.departments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -------- classes --------
drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes for select to authenticated using (true);
drop policy if exists classes_admin_write on public.classes;
create policy classes_admin_write on public.classes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -------- subjects --------
drop policy if exists subjects_select on public.subjects;
create policy subjects_select on public.subjects for select to authenticated using (true);
drop policy if exists subjects_admin_write on public.subjects;
create policy subjects_admin_write on public.subjects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -------- rooms --------
drop policy if exists rooms_select on public.rooms;
create policy rooms_select on public.rooms for select to authenticated using (true);
drop policy if exists rooms_admin_write on public.rooms;
create policy rooms_admin_write on public.rooms
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -------- room_mappings --------
drop policy if exists room_mappings_select on public.room_mappings;
create policy room_mappings_select on public.room_mappings for select to authenticated using (true);
drop policy if exists room_mappings_admin_write on public.room_mappings;
create policy room_mappings_admin_write on public.room_mappings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -------- attendance_records --------
drop policy if exists attendance_select on public.attendance_records;
create policy attendance_select on public.attendance_records
  for select to authenticated
  using (
    student_id = auth.uid()
    or recorded_by_id = auth.uid()
    or public.is_admin()
    or (public.is_head()  and class_id in (
          select id from public.classes where department_id = public.auth_department_id()))
    or public.is_dosen()
  );

-- CORRECTED: students cannot insert/update attendance.
drop policy if exists attendance_insert on public.attendance_records;
create policy attendance_insert on public.attendance_records
  for insert to authenticated
  with check (public.is_dosen() or public.is_admin());

drop policy if exists attendance_update on public.attendance_records;
create policy attendance_update on public.attendance_records
  for update to authenticated
  using (public.is_dosen() or public.is_admin())
  with check (public.is_dosen() or public.is_admin());

drop policy if exists attendance_delete on public.attendance_records;
create policy attendance_delete on public.attendance_records
  for delete to authenticated using (public.is_admin());

-- -------- materials --------
drop policy if exists materials_select on public.materials;
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

drop policy if exists materials_insert on public.materials;
create policy materials_insert on public.materials
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.is_dosen() and uploaded_by_id = auth.uid())
  );

drop policy if exists materials_update on public.materials;
create policy materials_update on public.materials
  for update to authenticated
  using (public.is_admin() or (public.is_dosen() and uploaded_by_id = auth.uid()))
  with check (public.is_admin() or (public.is_dosen() and uploaded_by_id = auth.uid()));

drop policy if exists materials_delete on public.materials;
create policy materials_delete on public.materials
  for delete to authenticated
  using (public.is_admin() or (public.is_dosen() and uploaded_by_id = auth.uid()));

-- -------- tasks --------
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select to authenticated
  using (
    public.is_admin()
    or created_by_id = auth.uid()
    or (public.is_student() and class_id = public.auth_class_id())
    or (public.is_head()    and class_id in (
          select id from public.classes where department_id = public.auth_department_id()))
  );

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()));

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update to authenticated
  using (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()))
  with check (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()));

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
  for delete to authenticated
  using (public.is_admin() or (public.is_dosen() and created_by_id = auth.uid()));

-- -------- student_tasks (mark-as-done: STUDENT-only writes) --------
drop policy if exists student_tasks_select on public.student_tasks;
create policy student_tasks_select on public.student_tasks
  for select to authenticated
  using (
    public.is_admin()
    or user_id = auth.uid()
    or exists (select 1 from public.tasks t where t.id = task_id and t.created_by_id = auth.uid())
  );

drop policy if exists student_tasks_insert on public.student_tasks;
create policy student_tasks_insert on public.student_tasks
  for insert to authenticated
  with check (public.is_student() and user_id = auth.uid());

drop policy if exists student_tasks_update on public.student_tasks;
create policy student_tasks_update on public.student_tasks
  for update to authenticated
  using (public.is_student() and user_id = auth.uid())
  with check (public.is_student() and user_id = auth.uid());

drop policy if exists student_tasks_delete on public.student_tasks;
create policy student_tasks_delete on public.student_tasks
  for delete to authenticated using (public.is_admin());

-- -------- announcements (feed) --------
drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements for select to authenticated using (true);

drop policy if exists announcements_insert on public.announcements;
create policy announcements_insert on public.announcements
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and (public.is_admin() or public.is_head() or public.is_dosen())
  );

-- ADMIN SUPER POWER: admin edits/deletes ANY post (PRD: ADM-FEED-01/02)
drop policy if exists announcements_update on public.announcements;
create policy announcements_update on public.announcements
  for update to authenticated
  using (public.is_admin() or author_id = auth.uid())
  with check (public.is_admin() or author_id = auth.uid());

drop policy if exists announcements_delete on public.announcements;
create policy announcements_delete on public.announcements
  for delete to authenticated
  using (public.is_admin() or author_id = auth.uid());

-- -------- likes --------
drop policy if exists likes_select on public.likes;
create policy likes_select on public.likes for select to authenticated using (true);
drop policy if exists likes_insert on public.likes;
create policy likes_insert on public.likes for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists likes_delete on public.likes;
create policy likes_delete on public.likes for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- -------- comments --------
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select to authenticated using (true);
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists comments_update on public.comments;
create policy comments_update on public.comments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());
