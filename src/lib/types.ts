export type AttendanceStatus = 'present' | 'late' | 'sick' | 'absent';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  studentCount: number;
  classCount: number;
  icon: string;
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

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  classId: string;
  subjectId: string;
  date: string;
  records: Record<string, AttendanceStatus>;
}
