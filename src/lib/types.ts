// =====================================================================
// Academic Information System — Type Definitions
// Mirrors prisma/schema.prisma for client-side mock data.
// =====================================================================

export type Role = 'ADMIN' | 'HEAD' | 'DOSEN' | 'STUDENT';

export type AttendanceStatus = 'present' | 'late' | 'sick' | 'absent';

export type RoomType = 'LAB' | 'CLASSROOM' | 'AUDITORIUM' | 'SEMINAR_ROOM';

export type MaterialType = 'PDF' | 'SLIDE' | 'VIDEO' | 'LINK' | 'DOCUMENT';

export type ThemeMode = 'light' | 'dark' | 'system';

// ---------- User ----------
export interface User {
  id: string;
  email: string;
  role: Role;
  classId?: string;
  deptId?: string;
  profile: Profile;
}

export interface Profile {
  userId: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
}

// ---------- Academic ----------
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  studentCount: number;
  classCount: number;
  icon: string;
  headId?: string;
}

export interface Class {
  id: string;
  departmentId: string;
  name: string;
  semester: number;
  studentCount: number;
}

export interface Subject {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  credits: number;
}

export interface Student {
  id: string;
  classId: string;
  departmentId: string;
  name: string;
  nim: string;
  email: string;
}

// ---------- Room Mapping ----------
export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  notes?: string;
}

export interface RoomMapping {
  id: string;
  roomId: string;
  subjectId: string;
  classId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // "08:00"
  endTime: string;
}

// ---------- Task ----------
export interface Task {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // ISO
  createdById: string;
}

export interface TaskCompletion {
  taskId: string;
  userId: string;
  done: boolean;
  doneAt?: string;
}

// ---------- Material ----------
export interface Material {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: MaterialType;
  uploadedById: string;
  createdAt: string;
}

// ---------- Announcement / Feed ----------
export interface Announcement {
  id: string;
  authorId: string;
  classId?: string;
  deptId?: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  announcementId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Like {
  id: string;
  announcementId: string;
  userId: string;
}

// ---------- Attendance ----------
export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
  recordedBy: string;
}

export interface AttendanceSession {
  classId: string;
  subjectId: string;
  date: string;
  records: Record<string, AttendanceStatus>;
}
