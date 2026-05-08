# Architecture Design — AIS v2.0

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Client (Browser)                           │
├──────────────────────────────────────────────────────────────┤
│  AppShell                                                      │
│  ├── ThemeProvider (light/dark)                                │
│  ├── AuthProvider (role: admin|head|dosen|student)             │
│  ├── DataProvider (departments, rooms, tasks, materials, ...)  │
│  │                                                             │
│  ├── Desktop: Collapsible Sidebar (Framer Motion)              │
│  ├── Mobile:  Floating Glassmorphic Dock (bottom)              │
│  │                                                             │
│  └── Page Router (App Router)                                  │
│      ├── /              → Role-adaptive Dashboard              │
│      ├── /attendance    → Dosen                                │
│      ├── /materials     → Dosen + Student                      │
│      ├── /feed          → All (Student can like/comment)       │
│      ├── /tasks         → Student                              │
│      ├── /reports       → Head + Admin                         │
│      ├── /admin/users   → Admin                                │
│      ├── /admin/rooms   → Admin (Room Mapping)                 │
│      └── /profile       → All                                  │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│          Future Backend (Prisma + Supabase)                    │
│  ├── Postgres (via Supabase)                                   │
│  ├── Row-Level Security = RBAC                                 │
│  ├── Supabase Storage (material files, avatars)                │
│  └── Supabase Auth (email + magic link)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
academic-presence-system/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── prisma/
│   └── schema.prisma            # DB source-of-truth (future migration)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Shell: providers + sidebar + dock
│   │   ├── page.tsx             # Dashboard (role-adaptive)
│   │   ├── globals.css
│   │   ├── attendance/page.tsx
│   │   ├── materials/page.tsx
│   │   ├── feed/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── search/page.tsx
│   │   ├── profile/page.tsx
│   │   └── admin/
│   │       ├── users/page.tsx
│   │       ├── departments/page.tsx
│   │       └── rooms/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FloatingDock.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── RoleSwitcher.tsx
│   │   ├── ui/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── ClientOnly.tsx   # Hydration-safe wrapper
│   │   └── domain/
│   │       ├── DepartmentCard.tsx
│   │       ├── StatsCard.tsx
│   │       ├── TaskCard.tsx
│   │       ├── MaterialCard.tsx
│   │       ├── AnnouncementCard.tsx
│   │       └── RoomCard.tsx
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   ├── AuthContext.tsx      # Active role + user
│   │   └── DataContext.tsx      # Renamed from AttendanceContext
│   └── lib/
│       ├── data/                # Deterministic mock data
│       ├── types.ts
│       ├── rbac.ts              # Role → allowed nav items
│       └── utils.ts
├── package.json
├── tailwind.config.ts           # darkMode: 'class'
├── tsconfig.json
└── next.config.js
```

---

## 3. Database Schema (Prisma)

```prisma
// See prisma/schema.prisma for full source

model User {
  id          String   @id
  role        Role
  email       String   @unique
  profile     Profile?
  classId     String?
  class       Class?   @relation(fields: [classId], references: [id])
  deptId      String?
  dept        Department? @relation(fields: [deptId], references: [id])
  tasks       TaskCompletion[]
  comments    Comment[]
  likes       Like[]
  attendance  AttendanceRecord[]
}

model Profile {
  userId    String  @id
  user      User    @relation(fields: [userId], references: [id])
  fullName  String
  phone     String?
  address   String?
  avatarUrl String?
}

enum Role { ADMIN  HEAD  DOSEN  STUDENT }

model Department { id, name, code, headId }
model Class      { id, deptId, name, semester }
model Subject    { id, deptId, name, code, credits }

model Room {
  id       String @id
  name     String   // "Lab 1"
  building String   // "Building A"
  floor    Int      // 2
  capacity Int
  type     RoomType
}
enum RoomType { LAB  CLASSROOM  AUDITORIUM }

model RoomMapping {
  id        String @id
  roomId    String
  subjectId String
  classId   String
  dayOfWeek Int
  startTime String
  endTime   String
  @@unique([roomId, classId, dayOfWeek, startTime])
}

model Task {
  id         String @id
  subjectId  String
  title      String
  description String
  dueDate    DateTime
  createdBy  String
  completions TaskCompletion[]
}
model TaskCompletion {
  id        String @id
  taskId    String
  userId    String
  done      Boolean @default(false)
  doneAt    DateTime?
  @@unique([taskId, userId])
}

model Material {
  id        String @id
  subjectId String
  title     String
  fileUrl   String
  fileType  String
  uploadedBy String
  createdAt DateTime @default(now())
}

model Announcement {
  id        String @id
  authorId  String
  classId   String?
  deptId    String?
  title     String
  body      String
  createdAt DateTime @default(now())
  comments  Comment[]
  likes     Like[]
}
model Like    { id, announcementId, userId, createdAt }
model Comment { id, announcementId, userId, body, createdAt }

model AttendanceRecord {
  id         String @id
  studentId  String
  classId    String
  subjectId  String
  date       String
  status     AttendanceStatus
  recordedBy String
}
enum AttendanceStatus { PRESENT  LATE  SICK  ABSENT }
```

---

## 4. Hydration-Safe Strategy

### 4.1 The Problem
The previous `attendance.ts` mock used `Math.random()` at module load time. When Next.js pre-renders the page on the server and hydrates on the client, the two random outputs differ → **hydration mismatch**.

### 4.2 The Fix (3 layers)

1. **Deterministic mock data** — replace `Math.random()` with a seeded pseudo-random function so server and client produce identical arrays.
   ```ts
   // Mulberry32 deterministic PRNG
   function seeded(seed: number) {
     return () => {
       seed = (seed + 0x6D2B79F5) | 0;
       let t = seed;
       t = Math.imul(t ^ (t >>> 15), t | 1);
       t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
       return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
     };
   }
   ```

2. **`ClientOnly` wrapper** — for UI that inherently varies (current date, theme class before mount), render only after `useEffect` runs.
   ```tsx
   export default function ClientOnly({ children, fallback = null }) {
     const [mounted, setMounted] = useState(false);
     useEffect(() => setMounted(true), []);
     return mounted ? <>{children}</> : <>{fallback}</>;
   }
   ```

3. **Theme class applied via `<script>` in `<head>`** — prevents FOUC and matches SSR HTML.

### 4.3 Forbidden during SSR
- `Math.random()` at module scope
- `Date.now()` / `new Date()` for initial state
- `window`, `document`, `localStorage` at render time
- Any conditional rendering based on `typeof window`

---

## 5. RBAC (Role-Based Access Control)

```ts
// src/lib/rbac.ts
export const navByRole = {
  ADMIN:   ['dashboard','users','departments','rooms','reports','profile'],
  HEAD:    ['dashboard','reports','feed','materials','profile'],
  DOSEN:   ['dashboard','attendance','materials','feed','tasks','profile'],
  STUDENT: ['dashboard','materials','feed','tasks','attendance','profile'],
};
```

Each page performs `useAuth()` → checks `role` → renders content or redirects.

---

## 6. Navigation UX

### Desktop Sidebar
- Width 256px (expanded) / 72px (collapsed)
- Toggle with Framer Motion `layout` prop for smooth width animation
- Icons always visible; labels fade in when expanded
- Role-filtered nav items

### Mobile Floating Dock
- Fixed bottom-center, `backdrop-blur-xl`, `rounded-2xl`
- 5 primary icons with active indicator (Framer Motion `layoutId`)
- Glassmorphic: `bg-white/70 dark:bg-slate-900/70 border border-white/20`

---

## 7. Theme System

- `next-themes` pattern with `darkMode: 'class'` in Tailwind
- Inline `<script>` in `<head>` sets `<html class="dark">` before React hydrates
- `ThemeProvider` exposes `theme` and `setTheme`
- `localStorage` persistence

---

## 8. Future Extensions (Out of current scope)
- Real Supabase auth integration
- Real-time feed updates via Supabase Realtime
- File uploads to Supabase Storage
- Email notifications on new announcements
- Exporting reports to PDF
