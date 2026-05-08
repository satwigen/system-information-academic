'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  departments,
  classes,
  subjects,
  students,
  attendanceRecords,
  rooms as initialRooms,
  roomMappings as initialRoomMappings,
  tasks as initialTasks,
  taskCompletions as initialCompletions,
  materials as initialMaterials,
  announcements as initialAnnouncements,
  initialComments,
  initialLikes,
} from '@/lib/data';
import {
  Department,
  Class,
  Subject,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  Room,
  RoomMapping,
  Task,
  TaskCompletion,
  Material,
  Announcement,
  Comment,
  Like,
} from '@/lib/types';

interface DataContextType {
  // Static
  departments: Department[];
  classes: Class[];
  subjects: Subject[];
  students: Student[];

  // Attendance
  records: AttendanceRecord[];
  markAttendance: (studentId: string, classId: string, subjectId: string, date: string, status: AttendanceStatus) => void;
  markAllPresent: (classId: string, subjectId: string, date: string) => void;
  getStudentsByClass: (classId: string) => Student[];
  getClassesByDepartment: (deptId: string) => Class[];
  getSubjectsByDepartment: (deptId: string) => Subject[];
  getRecordsByStudent: (studentId: string) => AttendanceRecord[];
  getRecordsByClass: (classId: string) => AttendanceRecord[];
  searchStudents: (query: string, departmentFilter?: string) => Student[];

  // Rooms
  rooms: Room[];
  roomMappings: RoomMapping[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addRoomMapping: (mapping: Omit<RoomMapping, 'id'>) => void;
  deleteRoomMapping: (id: string) => void;

  // Tasks
  tasks: Task[];
  completions: TaskCompletion[];
  toggleTaskDone: (taskId: string, userId: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  getTasksForUser: (userId: string, classId?: string) => Task[];
  isTaskDone: (taskId: string, userId: string) => boolean;

  // Materials
  materials: Material[];
  addMaterial: (m: Omit<Material, 'id' | 'createdAt'>) => void;

  // Announcements / Feed
  announcements: Announcement[];
  comments: Comment[];
  likes: Like[];
  addAnnouncement: (a: Omit<Announcement, 'id' | 'createdAt'>) => void;
  toggleLike: (announcementId: string, userId: string) => void;
  addComment: (announcementId: string, userId: string, body: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Attendance
  const [records, setRecords] = useState<AttendanceRecord[]>(attendanceRecords);

  // Rooms
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomMappings, setRoomMappings] = useState<RoomMapping[]>(initialRoomMappings);
  const [roomCounter, setRoomCounter] = useState(1);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completions, setCompletions] = useState<TaskCompletion[]>(initialCompletions);
  const [taskCounter, setTaskCounter] = useState(1);

  // Materials
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [materialCounter, setMaterialCounter] = useState(1);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [likes, setLikes] = useState<Like[]>(initialLikes);
  const [feedCounter, setFeedCounter] = useState(1);

  // ---------- Lookups ----------
  const getClassesByDepartment = useCallback((deptId: string) => classes.filter((c) => c.departmentId === deptId), []);
  const getSubjectsByDepartment = useCallback((deptId: string) => subjects.filter((s) => s.departmentId === deptId), []);
  const getStudentsByClass = useCallback((classId: string) => students.filter((s) => s.classId === classId), []);
  const getRecordsByClass = useCallback((classId: string) => records.filter((r) => r.classId === classId), [records]);
  const getRecordsByStudent = useCallback((studentId: string) => records.filter((r) => r.studentId === studentId), [records]);

  const searchStudents = useCallback((query: string, departmentFilter?: string) => {
    let filtered = students;
    if (departmentFilter) filtered = filtered.filter((s) => s.departmentId === departmentFilter);
    if (query) {
      const lower = query.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(lower) || s.nim.toLowerCase().includes(lower));
    }
    return filtered;
  }, []);

  // ---------- Attendance ----------
  const markAttendance = useCallback(
    (studentId: string, classId: string, subjectId: string, date: string, status: AttendanceStatus) => {
      setRecords((prev) => {
        const idx = prev.findIndex(
          (r) => r.studentId === studentId && r.classId === classId && r.subjectId === subjectId && r.date === date
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], status };
          return next;
        }
        return [
          ...prev,
          {
            id: `att-new-${prev.length + 1}`,
            studentId,
            classId,
            subjectId,
            date,
            status,
            recordedBy: 'usr-dosen-001',
          },
        ];
      });
    },
    []
  );

  const markAllPresent = useCallback(
    (classId: string, subjectId: string, date: string) => {
      const classStudents = students.filter((s) => s.classId === classId);
      classStudents.forEach((s) => markAttendance(s.id, classId, subjectId, date, 'present'));
    },
    [markAttendance]
  );

  // ---------- Rooms ----------
  const addRoom = useCallback((room: Omit<Room, 'id'>) => {
    setRooms((prev) => [...prev, { ...room, id: `room-new-${Date.now()}-${prev.length}` }]);
  }, []);
  const updateRoom = useCallback((id: string, patch: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);
  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setRoomMappings((prev) => prev.filter((m) => m.roomId !== id));
  }, []);
  const addRoomMapping = useCallback((mapping: Omit<RoomMapping, 'id'>) => {
    setRoomMappings((prev) => [...prev, { ...mapping, id: `map-new-${Date.now()}-${prev.length}` }]);
  }, []);
  const deleteRoomMapping = useCallback((id: string) => {
    setRoomMappings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ---------- Tasks ----------
  const toggleTaskDone = useCallback((taskId: string, userId: string) => {
    setCompletions((prev) => {
      const idx = prev.findIndex((c) => c.taskId === taskId && c.userId === userId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          done: !next[idx].done,
          doneAt: !next[idx].done ? new Date().toISOString() : undefined,
        };
        return next;
      }
      return [...prev, { taskId, userId, done: true, doneAt: new Date().toISOString() }];
    });
  }, []);
  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    setTasks((prev) => [...prev, { ...task, id: `task-new-${Date.now()}-${prev.length}` }]);
  }, []);
  const getTasksForUser = useCallback(
    (userId: string, classId?: string) => {
      if (classId) return tasks.filter((t) => t.classId === classId);
      const student = students.find((s) => s.id === userId);
      if (student) return tasks.filter((t) => t.classId === student.classId);
      return tasks;
    },
    [tasks]
  );
  const isTaskDone = useCallback(
    (taskId: string, userId: string) =>
      completions.find((c) => c.taskId === taskId && c.userId === userId)?.done ?? false,
    [completions]
  );

  // ---------- Materials ----------
  const addMaterial = useCallback((m: Omit<Material, 'id' | 'createdAt'>) => {
    setMaterials((prev) => [
      ...prev,
      { ...m, id: `mat-new-${Date.now()}-${prev.length}`, createdAt: new Date().toISOString() },
    ]);
  }, []);

  // ---------- Announcements / Feed ----------
  const addAnnouncement = useCallback((a: Omit<Announcement, 'id' | 'createdAt'>) => {
    setAnnouncements((prev) => [
      { ...a, id: `ann-new-${Date.now()}-${prev.length}`, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);
  const toggleLike = useCallback((announcementId: string, userId: string) => {
    setLikes((prev) => {
      const idx = prev.findIndex((l) => l.announcementId === announcementId && l.userId === userId);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { id: `like-new-${Date.now()}-${prev.length}`, announcementId, userId }];
    });
  }, []);
  const addComment = useCallback((announcementId: string, userId: string, body: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: `cmt-new-${Date.now()}-${prev.length}`,
        announcementId,
        userId,
        body,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const value = useMemo<DataContextType>(
    () => ({
      departments,
      classes,
      subjects,
      students,
      records,
      markAttendance,
      markAllPresent,
      getStudentsByClass,
      getClassesByDepartment,
      getSubjectsByDepartment,
      getRecordsByStudent,
      getRecordsByClass,
      searchStudents,
      rooms,
      roomMappings,
      addRoom,
      updateRoom,
      deleteRoom,
      addRoomMapping,
      deleteRoomMapping,
      tasks,
      completions,
      toggleTaskDone,
      addTask,
      getTasksForUser,
      isTaskDone,
      materials,
      addMaterial,
      announcements,
      comments,
      likes,
      addAnnouncement,
      toggleLike,
      addComment,
    }),
    [
      records,
      markAttendance,
      markAllPresent,
      getStudentsByClass,
      getClassesByDepartment,
      getSubjectsByDepartment,
      getRecordsByStudent,
      getRecordsByClass,
      searchStudents,
      rooms,
      roomMappings,
      addRoom,
      updateRoom,
      deleteRoom,
      addRoomMapping,
      deleteRoomMapping,
      tasks,
      completions,
      toggleTaskDone,
      addTask,
      getTasksForUser,
      isTaskDone,
      materials,
      addMaterial,
      announcements,
      comments,
      likes,
      addAnnouncement,
      toggleLike,
      addComment,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
