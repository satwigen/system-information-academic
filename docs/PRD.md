# Product Requirements Document (PRD)
## SIAKAD — Sistem Informasi Akademik (v3.0)

---

## 1. Overview

### 1.1 Product
**SIAKAD** — a fully functional, database-driven academic information system built on **Supabase** (Postgres + Auth + Storage + RLS) with a **Next.js 14 App Router** frontend.

### 1.2 Status Transition
| Version | State | Data Layer |
|---------|-------|-----------|
| v1.0 | Prototype (attendance only) | Mock data |
| v2.0 | Prototype (4 roles, mock data, premium UI) | Mock data |
| **v3.0 (this)** | **Production** | **Supabase (Postgres + Auth + Storage)** |

### 1.3 Roles (unchanged)
| Role | Tier | Primary Function |
|------|------|------------------|
| **Admin** | System | Full system control + CRUD on everything |
| **Lecturer / Head** | Supervisor | Department oversight (no teaching tools) |
| **Dosen / Faculty** | Teaching | Take attendance, upload materials, post feed |
| **Student** | Consumer | View materials, track tasks, view own attendance |

---

## 2. Corrected Role Permission Matrix

> Changes from v2.0 are marked **(CORRECTED)**.

| Feature | Admin | Head | Dosen | Student |
|---------|:-----:|:----:|:-----:|:-------:|
| **Login** | ✅ | ✅ | ✅ | ✅ |
| **Profile self-edit** | ✅ | ✅ | ✅ | ✅ |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| Users CRUD | ✅ | — | — | — |
| Departments CRUD | ✅ | — | — | — |
| Courses/Subjects CRUD | ✅ | — | — | — |
| Classes CRUD | ✅ | — | — | — |
| **Room Mapping CRUD** | ✅ | — | — | — |
| Take attendance | — | — | ✅ | — **(CORRECTED)** |
| View own attendance | — | — | ✅ | ✅ |
| View dept attendance | — | ✅ | — | — |
| View all attendance | ✅ | — | — | — |
| Upload materials (≤ 50 MB) | ✅ | — | ✅ | — |
| Download own-class materials | — | — | ✅ | ✅ |
| **Head sees Materials** | ✅ | — **(REMOVED)** | ✅ | ✅ |
| Post announcement | ✅ | ✅ | ✅ | — |
| Like / comment | ✅ | ✅ | ✅ | ✅ |
| **Edit ANY feed post** | ✅ | — | — | — |
| **Delete ANY feed post** | ✅ | — | — | — |
| Edit own feed post | ✅ | ✅ | ✅ | — |
| Delete own feed post | ✅ | ✅ | ✅ | — |
| Create tasks | — | — | ✅ | — |
| **Mark task as Done** | — | — | — **(REMOVED from Dosen)** | ✅ |
| View reports | ✅ | ✅ | ✅ (own classes) | — |
| **Export PDF / Print reports** | ✅ | ✅ | ✅ | — |
| Search students | ✅ | ✅ | ✅ | — |

---

## 3. Functional Requirements (v3.0 Specific)

### 3.1 Auth (FR-AUTH) — NEW
| ID | Req |
|----|-----|
| AUTH-01 | Email + password login per role (Supabase Auth) |
| AUTH-02 | Dedicated login page at `/login` with role-aware redirect |
| AUTH-03 | Session persisted via Supabase SSR cookies (middleware-protected routes) |
| AUTH-04 | Role stored in `public.profiles.role` (not in JWT metadata alone — for RLS joins) |
| AUTH-05 | Server-side role check on every protected page |
| AUTH-06 | Logout clears session and redirects to `/login` |
| AUTH-07 | Password reset flow via email magic link |

### 3.2 Admin — Full CRUD (FR-ADMIN)
| ID | Entity | Operations |
|----|--------|-----------|
| ADM-CRUD-01 | Students | Create, Read, Update, Delete |
| ADM-CRUD-02 | Lecturers (Head, Dosen) | CRUD |
| ADM-CRUD-03 | Courses/Subjects | CRUD |
| ADM-CRUD-04 | Departments | CRUD |
| ADM-CRUD-05 | Classes | CRUD |
| ADM-CRUD-06 | Room Mapping | CRUD |
| ADM-FEED-01 | Edit ANY feed post | Admin override |
| ADM-FEED-02 | Delete ANY feed post | Admin override (cascade likes/comments) |

### 3.3 Room Mapping — Auto Expiry (FR-ROOM) — NEW
| ID | Req |
|----|-----|
| ROOM-01 | Mapping has `day_of_week`, `start_time`, `end_time` (time zone: Asia/Jakarta) |
| ROOM-02 | UI filters out mappings where (today is `day_of_week` AND `now > end_time`) |
| ROOM-03 | On other days: show full week ahead |
| ROOM-04 | Admin CRUD remains unaffected by expiry filter (admin sees all) |
| ROOM-05 | Expiry computed client-side (but wrapped in `ClientOnly` to stay hydration-safe) |

### 3.4 Reports Export (FR-REPORT) — NEW
| ID | Req |
|----|-----|
| REP-01 | "Export to PDF" button on every report view |
| REP-02 | "Print" button triggers native print dialog with print stylesheet |
| REP-03 | PDF uses `@react-pdf/renderer` (server-side rendered, no hydration impact) |
| REP-04 | Report includes: institution header, date range, filters applied, table + chart |

### 3.5 Dosen Workspace (FR-DOSEN) — UPDATED
| ID | Req |
|----|-----|
| DOS-MAT-01 | Upload via native `<input type="file">` to Supabase Storage |
| DOS-MAT-02 | Max file size 50 MB (client + server validation) |
| DOS-MAT-03 | Must select Class AND Date at upload time |
| DOS-MAT-04 | Material row stores `class_id`, `subject_id`, `session_date`, `file_path`, `file_size`, `mime_type` |
| DOS-MAT-05 | Dosen can delete own materials |
| DOS-ATT-01 | Attendance marks persist to `attendance_records` table on every click (optimistic UI) |
| DOS-ATT-02 | Each record records `recorded_by_id` = current dosen's user id |

### 3.6 Student Portal (FR-STUDENT) — UPDATED
| ID | Req |
|----|-----|
| STU-ATT-01 | Students have **NO** attendance-marking UI — **read-only** view of own records |
| STU-MAT-01 | See only materials whose `class_id` matches the student's class |
| STU-MAT-02 | Signed download URL via Supabase Storage (short-lived) |
| STU-TASK-01 | "Mark as Done" toggle is Student-only |
| STU-TASK-02 | Completion stored in `student_tasks` with `user_id` = student |

### 3.7 Head/Lecturer UI Cleanup (FR-HEAD) — UPDATED
| ID | Req |
|----|-----|
| HEAD-NAV-01 | Remove `/materials` from Head sidebar and dock |
| HEAD-NAV-02 | Head nav = Dashboard, Feed, Search, Reports, Profile |
| HEAD-FUNC-01 | Keep: department stats, student search, attendance reports, feed supervision |

---

## 4. Non-Functional Requirements

### 4.1 Performance & SSR
| ID | Req |
|----|-----|
| NFR-01 | All Supabase reads on protected pages use **Server Components** where possible |
| NFR-02 | Interactive bits (CRUD dialogs, toggles) use Server Actions or Route Handlers |
| NFR-03 | Zero hydration mismatches (keep v2 patterns: deterministic formatters, `ClientOnly` for timestamps) |

### 4.2 Security
| ID | Req |
|----|-----|
| SEC-01 | RLS enabled on every table |
| SEC-02 | Client never calls the database with the service-role key |
| SEC-03 | All mutations validated server-side |
| SEC-04 | Storage buckets enforce per-role access via RLS policies on `storage.objects` |

### 4.3 Availability
| ID | Req |
|----|-----|
| AV-01 | System remains read-accessible if Supabase Auth is degraded (public tables expose safe subsets) |
| AV-02 | Optimistic UI fallbacks for attendance / tasks / likes |

---

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Hydration warnings | 0 |
| Role-scoped page access leaks | 0 (verified by RLS test suite) |
| Material upload ≤ 50 MB round-trip | < 15 s on 10 Mbps |
| PDF export generation | < 4 s for a 500-row report |
| Auto-expiry freshness | ≤ 60 s lag from `end_time` |

---

## 6. Out of Scope (v3.0)
- Real-time Supabase subscriptions (v3.1)
- Mobile native apps
- Multi-tenant (multiple institutions)
- Grade/GPA computation
- Payment / tuition

---

## 7. Glossary

| Term | Meaning |
|------|---------|
| **SIAKAD** | Sistem Informasi Akademik (Academic Information System) |
| **NIM** | Nomor Induk Mahasiswa (Student ID) |
| **NIP** | Nomor Induk Pegawai (Staff ID) |
| **Dosen** | University lecturer (Indonesian) |
| **Kepala Program Studi / Head** | Department head (supervisor) |
