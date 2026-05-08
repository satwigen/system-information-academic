# Architecture — SIAKAD v3.0

---

## 1. Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 (App Router) | Server Components first |
| Language | TypeScript (strict) | — |
| UI | Tailwind CSS v3.4 (`darkMode: 'class'`) + Framer Motion | — |
| Icons | Lucide-React | — |
| **Database** | **Supabase (Postgres 15)** | Hosted |
| **Auth** | **Supabase Auth** (email + password) | SSR cookies |
| **Storage** | **Supabase Storage** | Buckets: `avatars`, `materials` |
| **Authorization** | **Postgres RLS** | Enforced at DB level |
| **PDF** | `@react-pdf/renderer` | Server-rendered, no hydration impact |
| Form Validation | Zod | Shared client + server |

---

## 2. High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                               │
├──────────────────────────────────────────────────────────────────────┤
│  Server Components (default)                                           │
│    ├── RootLayout                                                      │
│    │    ├── ThemeProvider (client)                                     │
│    │    ├── ToastProvider (client)                                     │
│    │    └── AppShell (client)                                          │
│    │                                                                   │
│    ├── /(auth)/login/page.tsx                                          │
│    │                                                                   │
│    └── /(app)/*/page.tsx                                               │
│         ├── reads via createServerClient()                             │
│         ├── guarded by middleware.ts                                   │
│         └── embeds <ClientIsland/> for interactions                    │
│                                                                        │
│  Client Components (interactive islands)                               │
│    ├── CRUD dialogs                                                    │
│    ├── Attendance grid (optimistic)                                    │
│    ├── Task toggle                                                     │
│    ├── Feed post composer / like / comment                             │
│    └── File upload (stream to Supabase Storage)                        │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│          Next.js Server (Server Actions + Route Handlers)             │
├──────────────────────────────────────────────────────────────────────┤
│  Server Actions (preferred)                                            │
│    └── mutate via createServerClient() — inherits user session         │
│                                                                        │
│  Route Handlers (where needed)                                         │
│    ├── /api/materials/upload    (multipart file)                       │
│    ├── /api/materials/[id]/download  (signed URL redirect)             │
│    ├── /api/reports/[type]/pdf  (@react-pdf streaming)                 │
│    └── /auth/callback           (Supabase PKCE)                        │
│                                                                        │
├──────────────────────────────────────────────────────────────────────┤
│                         Supabase                                       │
├──────────────────────────────────────────────────────────────────────┤
│  Auth   (users, sessions, JWT)                                         │
│  Postgres                                                              │
│    ├── public.profiles  (1:1 with auth.users)                          │
│    ├── departments, classes, subjects, rooms, room_mappings            │
│    ├── attendance_records, materials, tasks, student_tasks             │
│    └── announcements, likes, comments                                  │
│  Storage (RLS on storage.objects)                                      │
│    ├── avatars (public read, owner write)                              │
│    └── materials (private; signed URLs only)                           │
│  RLS policies enforce role-based access                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Route Map

### 3.1 Route Groups

```
src/app/
├── (auth)/
│   ├── login/page.tsx              # public
│   ├── forgot-password/page.tsx    # public
│   └── reset/page.tsx              # public (token link)
│
├── (app)/                          # middleware-protected
│   ├── layout.tsx                  # shell + role-aware nav
│   ├── page.tsx                    # role-adaptive dashboard
│   ├── attendance/page.tsx         # DOSEN write, STUDENT read-only
│   ├── materials/page.tsx          # DOSEN upload, STUDENT+DOSEN download
│   ├── feed/page.tsx               # ALL roles
│   ├── tasks/page.tsx              # STUDENT mark-done, DOSEN create
│   ├── reports/page.tsx            # ADMIN, HEAD, DOSEN (scoped)
│   ├── search/page.tsx             # ADMIN, HEAD, DOSEN
│   ├── profile/page.tsx            # ALL roles
│   └── admin/
│       ├── users/page.tsx          # ADMIN only
│       ├── departments/page.tsx    # ADMIN only
│       ├── classes/page.tsx        # ADMIN only
│       ├── subjects/page.tsx       # ADMIN only
│       └── rooms/page.tsx          # ADMIN only
│
├── api/
│   ├── auth/callback/route.ts
│   ├── materials/upload/route.ts
│   ├── materials/[id]/download/route.ts
│   └── reports/[type]/pdf/route.ts
│
└── middleware.ts                   # refresh session + gate (app)/* + admin/*
```

### 3.2 Role → Nav Items (corrected)

```ts
const NAV_BY_ROLE = {
  ADMIN:   ['dashboard','attendance','materials','feed','reports','search',
            'admin/users','admin/departments','admin/classes','admin/subjects',
            'admin/rooms','profile'],
  HEAD:    ['dashboard','feed','search','reports','profile'],  // NO materials, NO tasks, NO attendance
  DOSEN:   ['dashboard','attendance','materials','feed','tasks','reports','search','profile'],
  STUDENT: ['dashboard','attendance','materials','feed','tasks','profile'], // attendance is READ-ONLY
};
```

---

## 4. Auth & Session

### 4.1 Supabase Clients

Three distinct client factories, each with a single responsibility:

```
src/lib/supabase/
├── client.ts     # createBrowserClient()  — client components
├── server.ts     # createServerClient()   — RSC, server actions, route handlers
└── admin.ts      # createServiceClient()  — service role; SERVER ONLY; admin ops
```

### 4.2 Middleware Flow

```ts
// middleware.ts  — runs on every (app)/* request
const { user, session } = await supabase.auth.getUser();   // refreshes cookie
if (!user) redirect('/login');

// Role-gated sub-trees
if (pathname.startsWith('/admin')) {
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (data?.role !== 'ADMIN') redirect('/');
}
```

### 4.3 Session Source of Truth

- **Server:** `getUser()` from Supabase SSR cookies
- **Client:** `useUser()` hook subscribes to auth state changes for UI
- Role is fetched once per request from `profiles.role`, cached in React Context for the page

---

## 5. Data Flow Patterns

### 5.1 Read (page load)

```
Browser → Next.js RSC → createServerClient()
                       → supabase.from('materials').select(...)
                       → RLS filter by profiles.role
                       → HTML streamed back
```

### 5.2 Mutation — prefer Server Actions

```tsx
// page.tsx (server component)
<EditRoomDialog action={updateRoomAction} room={room} />

// actions.ts  (server action file, 'use server')
export async function updateRoomAction(id: string, patch: RoomPatch) {
  const supabase = createServerClient();
  const { error } = await supabase.from('rooms').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/rooms');
}
```

### 5.3 File Upload — Route Handler (multipart)

Server Actions have a 1 MB body limit; materials go through a route handler:

```
Client FormData → POST /api/materials/upload (server)
                 → server validates size ≤ 50 MB + mime type
                 → supabase.storage.from('materials').upload(...)
                 → insert row into materials table
                 → returns { id, filePath }
```

### 5.4 File Download — signed URL

```
Client → GET /api/materials/[id]/download
       → server checks RLS-permitted read
       → signed URL (valid 60 s)
       → 302 redirect to signed URL
```

---

## 6. Auto-Expiry Room Mapping

### 6.1 Design

- Source of truth: `room_mappings` table has `day_of_week` (0-6), `start_time`, `end_time` (time, Asia/Jakarta).
- Expiry is a **view-time filter**, NOT a data deletion.
- Admin screen bypasses the filter.

### 6.2 Implementation

**Option A (chosen):** Filter in a Server Component using the request time.

```ts
// app/(app)/page.tsx  (server component)
const { nowDay, nowHHMM } = getJakartaNow();   // pure server clock, no hydration risk
const { data } = await supabase
  .from('room_mappings_expanded')  // DB view joining room + subject + class
  .select('*')
  .or(`day_of_week.neq.${nowDay},end_time.gt.${nowHHMM}`);
```

Because this runs only on the server, there is no server/client divergence. Further auto-refresh happens via `revalidateTag('room-mappings')` from a cron route handler triggered every 15 min.

### 6.3 Database View

```sql
create view room_mappings_expanded as
  select m.*, r.name as room_name, r.building, r.floor,
         s.name as subject_name, s.code as subject_code,
         c.name as class_name, c.department_id
  from room_mappings m
  join rooms r on m.room_id = r.id
  join subjects s on m.subject_id = s.id
  join classes c on m.class_id = c.id;
```

---

## 7. Storage Buckets

| Bucket | Public | Policy Summary |
|--------|--------|----------------|
| `avatars` | Yes (read) | Auth user can upload to `{user_id}/` prefix |
| `materials` | No | Only authenticated; RLS joins to `materials` table for download permission |

All downloads of `materials` go through signed URLs issued by the server; no direct public URL.

---

## 8. Frontend State Architecture

```
RootLayout (Server)
├── ThemeProvider (client)
├── ToastProvider (client)
└── AppLayoutClient (client)
     ├── props: { user, role, profile }  ← fetched on server once
     ├── Sidebar (reads props)
     ├── FloatingDock (reads props)
     └── {children}  ← Server Components fetch their own data
```

Key change from v2: **no more `DataProvider` client context**. Data lives in Server Components; only transient UI state (dialog open, optimistic attendance) lives in client state.

---

## 9. Hydration Safety (carry-over from v2 + new)

| Rule | Fix |
|------|-----|
| No `Math.random()` / `Date.now()` at module scope | Deterministic seed or server-only |
| No `toLocaleDateString` without explicit `timeZone` | Use UTC or explicit `Asia/Jakarta` |
| No theme-dependent className differences on first paint | Inline `<script>` in `<head>` |
| Timestamps that include "now" | `<ClientOnly>` wrap |
| `useUser()` initial state | Pass `initialUser` from server to avoid flicker |

---

## 10. Project Structure (v3)

```
academic-presence-system/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── SUPABASE_SETUP.md          (NEW)
│   └── API_ROUTES.md              (NEW)
├── prisma/
│   └── schema.prisma              (updated to mirror SQL)
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql          (schema + RLS + functions + view)
│   │   └── 0002_storage.sql       (bucket policies)
│   └── seed.sql                   (demo users + departments)
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (app)/
│   │   └── api/
│   ├── components/
│   │   ├── layout/                (Sidebar, FloatingDock, Header — read server props)
│   │   ├── ui/                    (Card, Button, Dialog, Toast, ...)
│   │   └── domain/                (AttendanceGrid, TaskCard, MaterialUploader, ...)
│   ├── actions/                   (server actions grouped by entity)
│   │   ├── users.ts
│   │   ├── departments.ts
│   │   ├── rooms.ts
│   │   ├── materials.ts
│   │   ├── attendance.ts
│   │   ├── tasks.ts
│   │   └── feed.ts
│   ├── lib/
│   │   ├── supabase/              (client.ts, server.ts, admin.ts)
│   │   ├── validation/            (Zod schemas per entity)
│   │   ├── rbac.ts                (route + nav policy)
│   │   ├── time.ts                (getJakartaNow, formatDate, formatRelative)
│   │   └── utils.ts
│   └── types/
│       └── database.ts            (generated via `supabase gen types`)
├── .env.local.example
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 11. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only, never shipped to client
NEXT_PUBLIC_SITE_URL=             # used for magic-link redirects
```

`SUPABASE_SERVICE_ROLE_KEY` is referenced only in `src/lib/supabase/admin.ts`, which is never imported by a client component.

---

## 12. Deployment

- **Host:** Vercel
- **DB migrations:** `supabase db push` from CI after PR merge
- **Type generation:** `supabase gen types typescript --project-id ... > src/types/database.ts` runs in CI

---

## 13. Future (Out of v3.0 Scope)

- Real-time subscriptions on feed
- Supabase Edge Functions for scheduled report digests
- Multi-institution tenancy
- Mobile native app sharing the same Supabase
