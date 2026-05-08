# Product Requirements Document (PRD)
## Academic Presence System - Student Attendance Management

---

## 1. Overview

### 1.1 Product Name
**Academic Presence System (APS)**

### 1.2 Purpose
A modern, minimalist web application for managing student attendance across multiple departments in an academic institution. The system enables lecturers to efficiently track, manage, and report student attendance.

### 1.3 Target Users
- **Primary:** Lecturers / Instructors
- **Secondary:** Department Administrators

---

## 2. Scope

### 2.1 Departments Covered
1. **Information Technology (IT)**
2. **Informatics**
3. **Digital Business**

### 2.2 Core Features
| Feature | Priority | Description |
|---------|----------|-------------|
| Dashboard | P0 | Central hub for selecting department, class, and subject |
| Attendance Tracking | P0 | Mark student attendance with status options |
| Summary Reports | P1 | Visual reports per class with attendance statistics |
| Search & Filter | P1 | Filter by department and search by student name |

---

## 3. Functional Requirements

### 3.1 Dashboard (FR-001)
- Display overview statistics (total students, classes, attendance rate)
- Department selector with card-based navigation
- Quick access to recent attendance sessions
- Visual indicators for each department

### 3.2 Attendance Management (FR-002)
- **Selection Flow:** Department → Class → Subject → Date
- **Status Options:**
  - ✅ Present (Hadir)
  - ⏰ Late (Terlambat)
  - 🏥 Sick (Sakit)
  - ❌ Absent (Alfa)
- Bulk actions (mark all present)
- Save attendance records per session

### 3.3 Summary Reports (FR-003)
- Per-class attendance summary
- Percentage breakdown by status type
- Student-level attendance history
- Filter by date range

### 3.4 Search & Filter (FR-004)
- Global search by student name
- Filter by department
- Filter by class
- Real-time search results

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time < 2 seconds
- Smooth transitions and animations
- Responsive across all device sizes

### 4.2 Design Requirements
- **Theme:** Academic, clean, ultra-minimalist
- **Color Palette:**
  - Primary: Midnight Navy (#1E293B)
  - Secondary: Slate Gray (#64748B)
  - Accent: Electric Blue (#3B82F6)
  - Background: Off-white (#F8FAFC)
  - Surface: White (#FFFFFF)
- **UI Elements:**
  - Cards with subtle shadows (shadow-sm to shadow-md)
  - Rounded corners (rounded-xl)
  - Lucide-React icons
  - Clean typography with Inter font

### 4.3 Technical Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide-React
- **State:** React useState/useContext (client-side)
- **Data:** Mock data (JSON-based)

---

## 5. User Stories

### US-001: View Dashboard
> As a lecturer, I want to see an overview of all departments and quick stats so I can navigate to the relevant class quickly.

### US-002: Take Attendance
> As a lecturer, I want to select a department, class, and subject, then mark each student's attendance status for today's session.

### US-003: View Reports
> As a lecturer, I want to see attendance summaries for each class so I can identify students with poor attendance.

### US-004: Search Students
> As a lecturer, I want to search for a specific student across all departments to quickly find their attendance record.

---

## 6. Data Model

### Entities
- **Department:** id, name, code, description, studentCount
- **Class:** id, departmentId, name, semester, studentCount
- **Subject:** id, departmentId, name, code, credits
- **Student:** id, classId, departmentId, name, nim (student ID), email
- **AttendanceRecord:** id, studentId, classId, subjectId, date, status

---

## 7. Success Metrics
- System loads within 2 seconds
- All CRUD operations for attendance work correctly
- Reports accurately reflect attendance data
- Search returns results in < 500ms
