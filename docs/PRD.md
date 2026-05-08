# Product Requirements Document (PRD)
## Academic Information System (AIS) — v2.0

---

## 1. Overview

### 1.1 Product Name
**Academic Information System (AIS)**
> _Formerly Academic Presence System — now a full-stack role-based platform._

### 1.2 Purpose
A comprehensive, modern academic platform covering attendance, materials, announcements, tasks, room mapping, and profile management for four distinct user roles.

### 1.3 Target Users (4 Roles)
| Role | Description |
|------|-------------|
| **Admin** | System-wide management: users, departments, classes, subjects, room mapping |
| **Lecturer (Head)** | Head of department — academic oversight and supervision |
| **Dosen (Faculty)** | Teaching staff — attendance, materials, announcements |
| **Student** | Views materials, interacts with feed, tracks personal tasks |

---

## 2. Departments & Scale

### 2.1 Departments
1. Information Technology (IT)
2. Informatics (INF)
3. Digital Business (DB)

### 2.2 Scale
- 4 roles × RBAC permissions
- 3 departments, 9 classes, 88 students
- Full CRUD for rooms, tasks, materials, announcements

---

## 3. Functional Requirements by Role

### 3.1 Admin (FR-ADMIN)
| ID | Feature | Description |
|----|---------|-------------|
| ADM-01 | User Management | Create, update, delete users across all roles |
| ADM-02 | Department Management | CRUD for departments and associated classes |
| ADM-03 | **Room Mapping System** | Assign subjects to specific rooms (building, floor, room number, capacity, type: Lab / Classroom / Auditorium) |
| ADM-04 | Global Analytics | View system-wide attendance & engagement metrics |

### 3.2 Lecturer / Head (FR-HEAD)
| ID | Feature | Description |
|----|---------|-------------|
| HEAD-01 | Department Oversight | View all classes, dosen, students within their department |
| HEAD-02 | Faculty Performance | Monitor dosen engagement (materials posted, attendance taken) |
| HEAD-03 | Supervision Reports | High-level attendance trends per class / subject |

### 3.3 Dosen / Faculty (FR-DOSEN)
| ID | Feature | Description |
|----|---------|-------------|
| DOS-01 | Attendance Management | Record attendance with Present / Late / Sick / Absent |
| DOS-02 | Material Upload | Upload PDFs, slides, videos tagged to subject & class |
| DOS-03 | Announcement Feed | Post announcements to class feed |
| DOS-04 | Task Assignment | Create tasks/assignments visible to students |

### 3.4 Student (FR-STUDENT)
| ID | Feature | Description |
|----|---------|-------------|
| STU-01 | Materials Browser | View/download materials per subject |
| STU-02 | Interactive Feed | Like & comment on announcements |
| STU-03 | **Task Management** | Toggle "Mark as Done" for assignments, track progress % |
| STU-04 | Personal Attendance | View own attendance history & stats |

### 3.5 Profile System (All Roles)
| ID | Feature |
|----|---------|
| PROF-01 | Profile image upload (avatar) |
| PROF-02 | Full name, email, phone, address |
| PROF-03 | Password change |
| PROF-04 | Notification preferences |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- No hydration mismatch errors (SSR-safe)
- First paint < 1.5s
- Smooth 60fps animations (Framer Motion)

### 4.2 UI / UX
- **Navigation:** Glassmorphic Floating Dock (mobile bottom) + Collapsible Sidebar (desktop)
- **Theme:** Native Light & Dark mode with system preference detection
- **Animations:** Framer Motion for transitions, hover, and micro-interactions
- **Responsive:** Mobile (< 768px) / Tablet (768–1024px) / Desktop (> 1024px)

### 4.3 Color Palette (Modern & Premium)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | Indigo-600 `#4F46E5` | Indigo-500 | Brand, CTAs |
| Success | Emerald-500 `#10B981` | Emerald-400 | Attendance / Task Done |
| Accent | Violet-500 `#8B5CF6` | Violet-400 | Interactive highlights |
| Background | Slate-50 `#F8FAFC` | Deep Navy `#0F172A` | Page bg |
| Surface | White `#FFFFFF` | Slate-800 `#1E293B` | Cards |
| Border | Slate-200 `#E2E8F0` | Slate-700 `#334155` | Dividers |

### 4.4 Visual Style
- `backdrop-blur-xl` for glassmorphic elements
- `rounded-2xl` for cards
- Lucide-React icons throughout
- Data Cards with progress bars for tasks

---

## 5. Technical Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS v3.4 |
| Animation | Framer Motion |
| Icons | Lucide-React |
| ORM (future) | Prisma |
| DB (future) | Supabase (Postgres) |
| Auth (future) | Supabase Auth + RBAC |
| State | React Context (client-side for mock data) |

> _Prisma schema is provided as the source-of-truth for future DB integration. Current implementation uses mock data hydrated client-side to simulate the same relations._

---

## 6. Core User Stories

- **US-ADM-01:** As an Admin, I assign Subject `Web Development` to Room `Lab 1, 2nd Floor` so students know where to attend.
- **US-STU-01:** As a Student, I toggle a task as "Done" and my progress bar advances so I can track what I've completed.
- **US-DOS-01:** As a Dosen, I upload a PDF material so my class can download it.
- **US-HEAD-01:** As a Head, I view my department's aggregate attendance to identify struggling classes.
- **US-ALL-01:** As any user, I switch between Light and Dark mode and my preference persists.

---

## 7. Success Metrics
- Zero hydration warnings in console
- Theme switch is instant (< 50ms)
- All role-scoped pages enforce RBAC
- Task "Mark as Done" reflects in progress ring in real-time
