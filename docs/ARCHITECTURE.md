# Architecture Design Document
## Academic Presence System

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Dashboard   │  │  Attendance  │  │    Reports    │  │
│  │    Page      │  │     Page     │  │     Page      │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Shared Components Layer                  ││
│  │  (Layout, Sidebar, Cards, Buttons, Search)           ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │              State Management (Context)              ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Data Layer (Mock Data / Lib)            ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | SSR, routing, React framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Icons | Lucide-React | Consistent icon set |
| Language | TypeScript | Type safety |
| State | React Context + useState | Client-side state |
| Data | JSON mock data | Development data source |

---

## 2. Project Structure

```
academic-presence-system/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with sidebar
│   │   ├── page.tsx                # Dashboard (home page)
│   │   ├── globals.css             # Global styles
│   │   ├── attendance/
│   │   │   └── page.tsx            # Attendance management page
│   │   ├── reports/
│   │   │   └── page.tsx            # Summary reports page
│   │   └── search/
│   │       └── page.tsx            # Search & filter page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   └── Header.tsx          # Page header component
│   │   ├── ui/
│   │   │   ├── Card.tsx            # Reusable card component
│   │   │   ├── Button.tsx          # Button variants
│   │   │   ├── Select.tsx          # Select dropdown
│   │   │   ├── Badge.tsx           # Status badge
│   │   │   └── SearchInput.tsx     # Search input field
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx       # Statistics card
│   │   │   └── DepartmentCard.tsx  # Department overview card
│   │   ├── attendance/
│   │   │   ├── StudentRow.tsx      # Student attendance row
│   │   │   └── StatusButton.tsx    # Attendance status button
│   │   └── reports/
│   │       ├── ReportCard.tsx      # Report summary card
│   │       └── AttendanceChart.tsx # Visual chart component
│   ├── lib/
│   │   ├── data/
│   │   │   ├── departments.ts     # Department mock data
│   │   │   ├── classes.ts         # Classes mock data
│   │   │   ├── subjects.ts        # Subjects mock data
│   │   │   ├── students.ts        # Students mock data
│   │   │   └── attendance.ts      # Attendance records
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── utils.ts               # Utility functions
│   └── context/
│       └── AttendanceContext.tsx   # Global attendance state
├── public/
│   └── favicon.ico
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 3. Component Architecture

### 3.1 Layout Hierarchy

```
RootLayout
├── Sidebar (fixed left)
│   ├── Logo/Brand
│   ├── Navigation Items
│   │   ├── Dashboard
│   │   ├── Attendance
│   │   ├── Reports
│   │   └── Search
│   └── User Info (placeholder)
└── Main Content Area
    ├── Header (page title + actions)
    └── Page Content (dynamic)
```

### 3.2 Page Components

#### Dashboard Page
```
DashboardPage
├── Header ("Dashboard")
├── StatsRow
│   ├── StatsCard (Total Students)
│   ├── StatsCard (Total Classes)
│   ├── StatsCard (Avg Attendance)
│   └── StatsCard (Today's Sessions)
└── DepartmentGrid
    ├── DepartmentCard (Information Technology)
    ├── DepartmentCard (Informatics)
    └── DepartmentCard (Digital Business)
```

#### Attendance Page
```
AttendancePage
├── Header ("Attendance")
├── SelectionBar
│   ├── Select (Department)
│   ├── Select (Class)
│   ├── Select (Subject)
│   └── DatePicker
├── ActionBar
│   ├── Button (Mark All Present)
│   └── Button (Save)
└── StudentList
    └── StudentRow (× N)
        ├── StudentInfo (name, NIM)
        └── StatusButtons (Present|Late|Sick|Absent)
```

#### Reports Page
```
ReportsPage
├── Header ("Reports")
├── FilterBar
│   ├── Select (Department)
│   └── Select (Class)
└── ReportGrid
    └── ReportCard (× N)
        ├── ClassInfo
        ├── AttendanceChart (bar/donut)
        └── StatusBreakdown
```

#### Search Page
```
SearchPage
├── Header ("Search")
├── SearchBar
│   ├── SearchInput
│   └── FilterDropdown (Department)
└── ResultsList
    └── StudentCard (× N)
        ├── StudentInfo
        ├── DepartmentBadge
        └── AttendanceOverview
```

---

## 4. Data Flow

### 4.1 State Management

```
AttendanceContext (Provider)
├── State:
│   ├── departments[]
│   ├── classes[]
│   ├── subjects[]
│   ├── students[]
│   ├── attendanceRecords[]
│   ├── selectedDepartment
│   ├── selectedClass
│   └── selectedSubject
├── Actions:
│   ├── setDepartment(id)
│   ├── setClass(id)
│   ├── setSubject(id)
│   ├── markAttendance(studentId, status)
│   ├── markAllPresent(classId)
│   ├── saveAttendance()
│   └── getReport(classId)
└── Computed:
    ├── filteredStudents
    ├── attendanceStats
    └── classReport
```

### 4.2 Mock Data Strategy
- All data stored as TypeScript constants in `/src/lib/data/`
- Each department has 2-3 classes
- Each class has 8-12 students
- Pre-generated attendance records for demonstration
- Data is loaded into context on app initialization

---

## 5. Design System

### 5.1 Color Tokens

```css
/* Primary Palette */
--color-navy:        #1E293B;   /* Primary text, headers */
--color-navy-light:  #334155;   /* Secondary elements */
--color-slate:       #64748B;   /* Body text, descriptions */
--color-slate-light: #94A3B8;   /* Placeholder, disabled */

/* Accent */
--color-blue:        #3B82F6;   /* Primary buttons, links */
--color-blue-hover:  #2563EB;   /* Button hover state */
--color-blue-light:  #EFF6FF;   /* Blue tint backgrounds */

/* Backgrounds */
--color-bg:          #F8FAFC;   /* Page background */
--color-surface:     #FFFFFF;   /* Card background */
--color-border:      #E2E8F0;   /* Borders, dividers */

/* Status Colors */
--color-present:     #10B981;   /* Green - Present */
--color-late:        #F59E0B;   /* Amber - Late */
--color-sick:        #8B5CF6;   /* Purple - Sick */
--color-absent:      #EF4444;   /* Red - Absent */
```

### 5.2 Typography Scale
- **H1:** 2rem (32px), font-bold, navy
- **H2:** 1.5rem (24px), font-semibold, navy
- **H3:** 1.25rem (20px), font-medium, navy
- **Body:** 1rem (16px), font-normal, slate
- **Small:** 0.875rem (14px), font-normal, slate-light

### 5.3 Component Styling Patterns
- **Cards:** `bg-white rounded-xl shadow-sm border border-slate-100 p-6`
- **Buttons:** `px-4 py-2 rounded-lg font-medium transition-all`
- **Inputs:** `border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500`
- **Sidebar:** `bg-slate-900 text-white w-64 fixed h-full`

---

## 6. Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Home with stats and department overview |
| `/attendance` | Attendance | Take/manage attendance |
| `/reports` | Reports | View summary reports |
| `/search` | Search | Search and filter students |

---

## 7. Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 768px) | Sidebar collapses to hamburger menu, single column |
| Tablet (768-1024px) | Sidebar visible, 2-column grid |
| Desktop (> 1024px) | Full sidebar, 3-4 column grid |

---

## 8. Future Considerations (Out of Scope)
- Authentication & authorization
- Database integration (PostgreSQL/MongoDB)
- API routes for CRUD operations
- Export to CSV/PDF
- Email notifications for absence
- Real-time updates with WebSockets
