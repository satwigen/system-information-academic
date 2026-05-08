'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, Save, UserCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useAttendance } from '@/context/AttendanceContext';
import { AttendanceStatus } from '@/lib/types';
import { cn, getTodayString, getStatusLabel } from '@/lib/utils';

const statusOptions: { value: AttendanceStatus; label: string; color: string; activeColor: string }[] = [
  { value: 'present', label: 'Present', color: 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600', activeColor: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { value: 'late', label: 'Late', color: 'border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600', activeColor: 'bg-amber-100 border-amber-300 text-amber-700' },
  { value: 'sick', label: 'Sick', color: 'border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600', activeColor: 'bg-purple-100 border-purple-300 text-purple-700' },
  { value: 'absent', label: 'Absent', color: 'border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600', activeColor: 'bg-red-100 border-red-300 text-red-700' },
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
  } = useAttendance();

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [saved, setSaved] = useState(false);

  const classOptions = useMemo(() => {
    if (!selectedDept) return [];
    return getClassesByDepartment(selectedDept).map(c => ({ value: c.id, label: c.name }));
  }, [selectedDept, getClassesByDepartment]);

  const subjectOptions = useMemo(() => {
    if (!selectedDept) return [];
    return getSubjectsByDepartment(selectedDept).map(s => ({ value: s.id, label: s.name }));
  }, [selectedDept, getSubjectsByDepartment]);

  const students = useMemo(() => {
    if (!selectedClass) return [];
    return getStudentsByClass(selectedClass);
  }, [selectedClass, getStudentsByClass]);

  const getStudentStatus = (studentId: string): AttendanceStatus | null => {
    const record = records.find(
      r => r.studentId === studentId && r.classId === selectedClass && r.subjectId === selectedSubject && r.date === selectedDate
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
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeptChange = (val: string) => {
    setSelectedDept(val);
    setSelectedClass('');
    setSelectedSubject('');
  };

  return (
    <div>
      <Header
        title="Attendance"
        description="Record student attendance for today's session."
      />

      {/* Selection Bar */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Department"
            options={departments.map(d => ({ value: d.id, label: d.name }))}
            value={selectedDept}
            onChange={handleDeptChange}
            placeholder="Select department"
          />
          <Select
            label="Class"
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder="Select class"
          />
          <Select
            label="Subject"
            options={subjectOptions}
            value={selectedSubject}
            onChange={setSelectedSubject}
            placeholder="Select subject"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      {students.length > 0 && selectedSubject && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{students.length}</span> students
          </p>
          <div className="flex items-center gap-3">
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

      {/* Student List */}
      {students.length > 0 && selectedSubject ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase w-8">#</span>
            <span className="text-xs font-medium text-slate-500 uppercase">Student</span>
            <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
          </div>
          <div className="divide-y divide-slate-50">
            {students.map((student, index) => {
              const currentStatus = getStudentStatus(student.id);
              return (
                <div
                  key={student.id}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm text-slate-400 w-8">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.nim}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(student.id, option.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                          currentStatus === option.value ? option.activeColor : option.color
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
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">No Class Selected</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Select a department, class, and subject above to start recording attendance.
            </p>
          </div>
        </Card>
      )}

      {/* Save Notification */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Attendance saved successfully!</span>
        </div>
      )}
    </div>
  );
}
