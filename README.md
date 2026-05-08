# SIAKAD — Sistem Informasi Akademik (v3.0)

A full-stack, role-based academic information system. Next.js 14 App Router + Supabase (Postgres, Auth, Storage, RLS) + TypeScript + Tailwind + Framer Motion.

---

## What ships in v3.0

| Role | Primary responsibilities |
|------|--------------------------|
| **Admin** | Full CRUD on users, departments, classes, courses, rooms + mappings; super-power to edit/delete any feed post |
| **Lecturer / Head** | Dashboard, Feed, Reports (with PDF + Print), Search — supervision only |
| **Dosen (Faculty)** | Take attendance, upload materials (≤ 50 MB), create tasks, post feed |
| **Student** | Read-only attendance view, view/download materials, mark tasks as done, interact with feed |

Core features:

- Real **Supabase Auth** login with role-aware redirects
- **Row-Level Security** enforced at the database layer
- **Server Components** + **Server Actions** (no client-side mock data, no global `DataContext`)
- **Room Mapping** with auto-expiry in **Asia/Jakarta** timezone (admin bypass)
- **Upload progress bar** for materials via XHR `upload.onprogress`
- **PDF export** via `@react-pdf/renderer`, server-rendered
- **Print** stylesheet for in-browser printing
- **Dark mode** with zero hydration flicker (inline `<script>` in `<head>`)
- **Framer Motion** animations in sidebar, dock, dialogs, and page transitions

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in from your Supabase project settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable or anon key>
SUPABASE_SERVICE_ROLE_KEY=<service-role key — server only>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=<any random string>
```

### 3. Apply the database schema

Run in order in the Supabase SQL Editor:

1. `supabase/migrations/0001_init.sql` — tables, enums, views, triggers, RLS
2. `supabase/migrations/0002_storage.sql` — `avatars` (public) and `materials` (private) buckets + policies
3. `supabase/seed.sql` — reference data: 3 departments, 9 classes, 9 subjects, 8 rooms, 8 mappings

### 4. Seed demo users

```bash
npm run seed:users
```

This calls `supabase.auth.admin.createUser()` for each demo account and wires their `profiles` row (department, class, NIM/NIP).

| Role | Email | Password |
|------|-------|----------|
| Admin   | `admin@siakad.test`   | `Admin#123`   |
| Head    | `head@siakad.test`    | `Head#123`    |
| Dosen   | `dosen@siakad.test`   | `Dosen#123`   |
| Student | `student@siakad.test` | `Student#123` |

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`.

---

## Project Layout

```
siakad/
├── docs/                          # PRD, ARCHITECTURE, SUPABASE_SETUP, API_ROUTES
├── supabase/
│   ├── migrations/                # 0001_init.sql, 0002_storage.sql
│   └── seed.sql                   # reference data
├── scripts/
│   └── seed-users.ts              # demo-account seeder (service-role)
├── prisma/schema.prisma           # reference (source-of-truth is SQL)
├── src/
│   ├── middleware.ts              # session refresh + role gate
│   ├── app/
│   │   ├── (auth)/                # login, forgot-password, reset
│   │   ├── (app)/                 # protected pages — inherit AppShell
│   │   │   ├── admin/             # users / departments / classes / subjects / rooms
│   │   │   ├── attendance /       # DOSEN write, STUDENT read-only
│   │   │   ├── materials  /       # DOSEN upload, STUDENT+DOSEN download
│   │   │   ├── feed /             # admin can edit/delete any post
│   │   │   ├── tasks /            # STUDENT-only mark-as-done
│   │   │   ├── reports /          # + PDF export + Print
│   │   │   ├── search /
│   │   │   ├── profile /
│   │   │   └── page.tsx           # role-adaptive dashboard
│   │   ├── auth/callback/         # Supabase PKCE code exchange
│   │   └── api/
│   │       ├── attendance/roster/
│   │       ├── avatars/upload/
│   │       ├── materials/upload/
│   │       ├── materials/[id]/download/
│   │       └── reports/[type]/pdf/
│   ├── actions/                   # server actions by entity
│   ├── components/
│   │   ├── layout/                # Sidebar, FloatingDock, MobileTopBar, MinuteTick
│   │   ├── ui/                    # Card, Button, Dialog, Toast, Input, Select, ...
│   │   └── domain/                # StatsCard, ConfirmButton
│   ├── lib/
│   │   ├── supabase/              # client.ts, server.ts, admin.ts, middleware.ts
│   │   ├── validation/            # Zod schemas
│   │   ├── auth.ts                # requireSession, requireRole
│   │   ├── rbac.ts                # nav + canAccess
│   │   ├── time.ts                # Jakarta time + isRoomSlotExpired
│   │   └── utils.ts
│   └── types/database.ts          # DB types (mirror of SQL)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Role → Access matrix

| Feature | Admin | Head | Dosen | Student |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Attendance (write) | ✅ | — | ✅ | — |
| Attendance (view own) | ✅ | — | ✅ | ✅ (read-only) |
| Attendance (view dept) | ✅ | ✅ | — | — |
| Materials upload | ✅ | — | ✅ | — |
| Materials download | ✅ | — | ✅ | ✅ |
| Feed post | ✅ | ✅ | ✅ | — |
| Feed edit/delete ANY post | ✅ | — | — | — |
| Tasks create | ✅ | — | ✅ | — |
| Tasks mark-as-done | — | — | — | ✅ |
| Reports view + export | ✅ | ✅ | ✅ | — |
| Search users | ✅ | ✅ | ✅ | — |
| Admin CRUD | ✅ | — | — | — |

Enforced at three layers: **middleware** → **page-level redirect** → **RLS policies**.

---

## Hydration Safety Rules

- No `Math.random()` at module scope.
- No `Date.now()` at initial render.
- `toLocaleDateString` is banned — use `formatDate` / `formatDateJakarta` from `lib/time.ts`.
- Theme class is applied by an inline `<script>` in `<head>` before React hydrates.
- Relative timestamps live inside `<ClientOnly>`.

---

## Scripts

```bash
npm run dev         # Next.js dev server
npm run build       # production build
npm run start       # production server
npm run lint        # Next ESLint
npm run typecheck   # tsc --noEmit
npm run seed:users  # create demo accounts in Supabase
```

---

## Docs

- `docs/PRD.md` — product requirements
- `docs/ARCHITECTURE.md` — system design
- `docs/SUPABASE_SETUP.md` — full SQL schema documentation
- `docs/API_ROUTES.md` — every server action + route handler contract
