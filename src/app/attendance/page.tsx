'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Save, UserCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useData } from '@/context/DataContext';
import { AttendanceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusOptions: { value: AttendanceStatus; label: string; inactive: string; active: string }[] = [
  { value: 'present', label: 'Present', inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-600', active: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' },
  { value: 'late',    label: 'Late',    inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:text-amber-600',    active: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' },
  { value: 'sick',    label: 'Sick',    inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-600',  active: 'bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300' },
  { value: 'absent',  label: 'Absent',  inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-300 hover:text-red-600',        active: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' },
];

export default function AttendancePage() {
  const {
    departments,
    getClassesByDepartment,
    getSubjectsByDepartment,
    getStudentsByClass,
    markAttendance,
    markAllPresent,
    records,
  } = useData();

  // Start with empty strings and set the default date only on the client (hydration-safe).
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    }
  }, [selectedDate]);

  const classOptions = useMemo(
    () => (selectedDept ? getClassesByDepartment(selectedDept).map((c) => ({ value: c.id, label: c.name })) : []),
    [selectedDept, getClassesByDepartment]
  );
  const subjectOptions = useMemo(
    () => (selectedDept ? getSubjectsByDepartment(selectedDept).map((s) => ({ value: s.id, label: s.name })) : []),
    [selectedDept, getSubjectsByDepartment]
  );
  const students = useMemo(
    () => (selectedClass ? getStudentsByClass(selectedClass) : []),
    [selectedClass, getStudentsByClass]
  );

  const getStudentStatus = (studentId: string): AttendanceStatus | null => {
    const record = records.find(
      (r) => r.studentId === studentId && r.classId === selectedClass && r.subjectId === selectedSubject && r.date === selectedDate
    );
    return record?.status || null;
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (selectedClass && selectedSubject && selectedDate) {
      markAttendance(studentId, selectedClass, selectedSubject, selectedDate, status);
      setSaved(false);
    }
  };

  const handleMarkAllPresent = () => {
    if (selectedClass && selectedSubject && selectedDate) {
      markAllPresent(selectedClass, selectedSubject, selectedDate);
      setSaved(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeptChange = (val: string) => {
    setSelectedDept(val);
    setSelectedClass('');
    setSelectedSubject('');
  };

  return (
    <div>
      <Header title="Attendance" description="Record student attendance for a session." />

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Department" options={departments.map((d) => ({ value: d.id, label: d.name }))} value={selectedDept}    onChange={handleDeptChange} placeholder="Select department" />
          <Select label="Class"      options={classOptions}    value={selectedClass}   onChange={setSelectedClass}   placeholder="Select class" />
          <Select label="Subject"    options={subjectOptions}  value={selectedSubject} onChange={setSelectedSubject} placeholder="Select subject" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </Card>

      {students.length > 0 && selectedSubject && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-700 dark:text-slate-200">{students.length}</span> students
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleMarkAllPresent}>
              <UserCheck className="w-4 h-4" />
              Mark All Present
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {students.length > 0 && selectedSubject ? (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase w-8">#</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Student</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student, index) => {
              const currentStatus = getStudentStatus(student.id);
              return (
                <div
                  key={student.id}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-slate-400 w-8">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.nim}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(student.id, option.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200',
                          currentStatus === option.value ? option.active : option.inactive
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No Class Selected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Select a department, class, and subject above to start recording attendance.
            </p>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-24 md:bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Attendance saved!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
