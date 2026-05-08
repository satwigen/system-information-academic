# Academic Information System (AIS)

A comprehensive, role-based academic platform with a modern, premium design. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Framer Motion.

> **v2.0 Revamp:** Now supports 4 roles (Admin, Head, Dosen, Student), Room Mapping, Tasks, Materials, Feed, and Profiles — with dark mode, Framer Motion navigation, and a Glassmorphic Floating Dock.

## Highlights

- **4 Roles with RBAC** — Admin, Lecturer (Head), Dosen (Faculty), Student
- **Room Mapping System** — Admin assigns subjects to specific rooms, buildings, floors, and time slots
- **Task Management** — Students toggle "Mark as Done" with progress rings
- **Materials** — Dosen uploads, Students download (PDF, Slides, Videos, Links)
- **Interactive Feed** — Announcements with like and comment
- **Profile System** — Avatar upload, name, email, phone, address, bio
- **Native Dark Mode** — Light/Dark/System, zero FOUC
- **Hydration-Safe** — No `Math.random()` or `Date.now()` at module scope
- **Glassmorphic Floating Dock** (mobile) + **Collapsible Sidebar** (desktop) with Framer Motion
- **Premium Color Palette** — Indigo-600, Emerald-500, Violet-500, Deep Navy dark mode

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3.4 (darkMode: class) |
| Animation | Framer Motion |
| Icons | Lucide-React |
| ORM (future) | Prisma |
| Database (future) | Supabase / Postgres |
| Auth (future) | Supabase Auth + RLS |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

**Use the Role Switcher in the sidebar** to view the system as Admin, Head, Dosen, or Student.

## Project Structure

```
academic-presence-system/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── prisma/
│   └── schema.prisma           # DB source-of-truth (11 models, 4 enums)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Shell + providers + theme init script
│   │   ├── page.tsx            # Role-adaptive dashboard
│   │   ├── attendance/         # Dosen takes attendance
│   │   ├── materials/          # Upload / download
│   │   ├── feed/               # Announcements + likes + comments
│   │   ├── tasks/              # "Mark as Done" progress
│   │   ├── reports/            # Head + Admin summaries
│   │   ├── search/             # Find students
│   │   ├── profile/            # Personal info + avatar
│   │   └── admin/
│   │       ├── users/          # User management
│   │       ├── departments/    # Department management
│   │       └── rooms/          # Room Mapping System
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx        # Collapsible, Framer Motion
│   │   │   ├── FloatingDock.tsx   # Glassmorphic mobile dock
│   │   │   ├── MobileTopBar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── RoleSwitcher.tsx
│   │   ├── ui/                   # Card, Button, Avatar, ProgressRing, etc.
│   │   └── domain/               # StatsCard, DepartmentCard
│   ├── context/
│   │   ├── ThemeContext.tsx     # Light/Dark/System
│   │   ├── AuthContext.tsx      # Active role + user + profile update
│   │   └── DataContext.tsx      # Rooms, tasks, materials, feed, attendance
│   └── lib/
│       ├── data/                # Deterministic mock data
│       ├── types.ts             # Mirrors prisma schema
│       ├── rbac.ts              # Role → allowed nav
│       └── utils.ts
```

## Hydration-Safe Patterns

Three layers prevent the "Hydration failed" error that plagued v1:

1. **Deterministic PRNG (Mulberry32)** replaces `Math.random()` in mock data — see `src/lib/data/attendance.ts`.
2. **Inline theme init script** in `<head>` applies the `dark` class before React hydrates — see `src/app/layout.tsx`.
3. **`ClientOnly` wrapper** defers client-only content (relative timestamps, theme toggle visuals) until after mount — see `src/components/ui/ClientOnly.tsx`.

## Design Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | `#4F46E5` (Indigo-600) | Indigo-500 | Brand, CTAs |
| Accent | `#8B5CF6` (Violet-500) | Violet-400 | Interactive highlights |
| Success | `#10B981` (Emerald-500) | Emerald-400 | Attendance / Task Done |
| Background | `#F8FAFC` (Slate-50) | `#0F172A` (Deep Navy) | Page bg |
| Surface | `#FFFFFF` | Slate-800 | Cards |

Cards use `rounded-2xl`, `backdrop-blur-xl` for glass variants, `shadow-lg` for elevated elements.

## Future Backend Integration

The `prisma/schema.prisma` is the source-of-truth for a production deploy:

1. Set up a Supabase project and run `npx prisma migrate dev`.
2. Replace the mock `DataProvider` with Supabase queries (or server actions).
3. Enable Row-Level Security for RBAC at the database level.
4. Use Supabase Storage for avatar and material file uploads.

## Demo User Accounts (via Role Switcher)

| Role | Demo Name | Email |
|------|-----------|-------|
| Admin   | Sarah Admin             | admin@campus.ac.id |
| Head    | Dr. Ahmad Wibowo        | dr.wibowo@campus.ac.id |
| Dosen   | Yudi Permana, M.Kom     | yudi.permana@campus.ac.id |
| Student | Ahmad Rizki Pratama     | ahmad.rizki@student.ac.id |
