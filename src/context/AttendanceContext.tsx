'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { departments, classes, subjects, students, attendanceRecords } from '@/lib/data';
import { Department, Class, Subject, Student, AttendanceRecord, AttendanceStatus } from '@/lib/types';

interface AttendanceContextType {
  departments: Department[];
  classes: Class[];
  subjects: Subject[];
  students: Student[];
  records: AttendanceRecord[];
  selectedDepartment: string;
  selectedClass: string;
  selectedSubject: string;
  setSelectedDepartment: (id: string) => void;
  setSelectedClass: (id: string) => void;
  setSelectedSubject: (id: string) => void;
  getClassesByDepartment: (deptId: string) => Class[];
  getSubjectsByDepartment: (deptId: string) => Subject[];
  getStudentsByClass: (classId: string) => Student[];
  getRecordsByClass: (classId: string) => AttendanceRecord[];
  getRecordsByStudent: (studentId: string) => AttendanceRecord[];
  markAttendance: (studentId: string, classId: string, subjectId: string, date: string, status: AttendanceStatus) => void;
  markAllPresent: (classId: string, subjectId: string, date: string) => void;
  searchStudents: (query: string, departmentFilter?: string) => Student[];
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>(attendanceRecords);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const getClassesByDepartment = useCallback((deptId: string) => {
    return classes.filter(c => c.departmentId === deptId);
  }, []);

  const getSubjectsByDepartment = useCallback((deptId: string) => {
    return subjects.filter(s => s.departmentId === deptId);
  }, []);

  const getStudentsByClass = useCallback((classId: string) => {
    return students.filter(s => s.classId === classId);
  }, []);

  const getRecordsByClass = useCallback((classId: string) => {
    return records.filter(r => r.classId === classId);
  }, [records]);

  const getRecordsByStudent = useCallback((studentId: string) => {
    return records.filter(r => r.studentId === studentId);
  }, [records]);

  const markAttendance = useCallback((studentId: string, classId: string, subjectId: string, date: string, status: AttendanceStatus) => {
    setRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.studentId === studentId && r.classId === classId && r.subjectId === subjectId && r.date === date
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      }

      return [...prev, {
        id: `att-new-${Date.now()}-${studentId}`,
        studentId,
        classId,
        subjectId,
        date,
        status,
      }];
    });
  }, []);

  const markAllPresent = useCallback((classId: string, subjectId: string, date: string) => {
    const classStudents = students.filter(s => s.classId === classId);
    classStudents.forEach(student => {
      markAttendance(student.id, classId, subjectId, date, 'present');
    });
  }, [markAttendance]);

  const searchStudents = useCallback((query: string, departmentFilter?: string) => {
    let filtered = students;
    if (departmentFilter) {
      filtered = filtered.filter(s => s.departmentId === departmentFilter);
    }
    if (query) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(lower) ||
        s.nim.toLowerCase().includes(lower)
      );
    }
    return filtered;
  }, []);

  return (
    <AttendanceContext.Provider value={{
      departments,
      classes,
      subjects,
      students,
      records,
      selectedDepartment,
      selectedClass,
      selectedSubject,
      setSelectedDepartment,
      setSelectedClass,
      setSelectedSubject,
      getClassesByDepartment,
      getSubjectsByDepartment,
      getStudentsByClass,
      getRecordsByClass,
      getRecordsByStudent,
      markAttendance,
      markAllPresent,
      searchStudents,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
