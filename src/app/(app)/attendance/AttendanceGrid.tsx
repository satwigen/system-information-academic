'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Save, UserCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { todayJakarta } from '@/lib/time';
import { useToast } from '@/components/ui/Toast';
import { markAttendanceAction, markAllPresentAction } from '@/actions/attendance';
import type { AttendanceStatus, ClassRow, SubjectRow, DepartmentRow, ProfileRow, AttendanceRecordRow } from '@/types/database';

interface Props {
  departments: DepartmentRow[];
  classes: ClassRow[];
  subjects: SubjectRow[];
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; inactive: string; active: string }[] = [
  {
    value: 'PRESENT', label: 'Present',
    inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-600',
    active: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
  },
  {
    value: 'LATE', label: 'Late',
    inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:text-amber-600',
    active: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
  },
  {
    value: 'SICK', label: 'Sick',
    inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 hover:text-violet-600',
    active: 'bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300',
  },
  {
    value: 'ABSENT', label: 'Absent',
    inactive: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-300 hover:text-red-600',
    active: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300',
  },
];

export default function AttendanceGrid({ departments, classes, subjects }: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [deptId, setDeptId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [students, setStudents] = useState<ProfileRow[]>([]);
  const [records, setRecords] = useState<AttendanceRecordRow[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!date) setDate(todayJakarta());
  }, [date]);

  const classOptions = useMemo(
    () => (deptId ? classes.filter((c) => c.department_id === deptId) : []).map((c) => ({ value: c.id, label: c.name })),
    [deptId, classes],
  );
  const subjectOptions = useMemo(
    () => (deptId ? subjects.filter((s) => s.department_id === deptId) : []).map((s) => ({ value: s.id, label: s.name })),
    [deptId, subjects],
  );

  // Fetch students + existing records whenever class/subject/date changes.
  React.useEffect(() => {
    if (!classId || !subjectId || !date) {
      setStudents([]); setRecords([]);
      return;
    }
    setLoading(true);
    (async () => {
      const res = await fetch(
        `/api/attendance/roster?class_id=${classId}&subject_id=${subjectId}&session_date=${date}`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        const body = await res.json();
        setStudents(body.students ?? []);
        setRecords(body.records ?? []);
      }
      setLoading(false);
    })();
  }, [classId, subjectId, date]);

  const statusOf = (studentId: string): AttendanceStatus | null =>
    records.find((r) => r.student_id === studentId)?.status ?? null;

  const handleMark = (studentId: string, status: AttendanceStatus) => {
    if (!classId || !subjectId || !date) return;

    // Optimistic update
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.student_id === studentId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], status };
        return next;
      }
      return [
        ...prev,
        {
          id: `tmp-${studentId}`, student_id: studentId, class_id: classId, subject_id: subjectId,
          session_date: date, status, recorded_by_id: '', created_at: '', updated_at: '',
        },
      ];
    });

    startTransition(async () => {
      const result = await markAttendanceAction({
        student_id: studentId, class_id: classId, subject_id: subjectId, session_date: date, status,
      });
      if (!result.ok) {
        toast(result.error, 'error');
      }
    });
  };

  const handleMarkAll = () => {
    if (!classId || !subjectId || !date) return;
    startTransition(async () => {
      const result = await markAllPresentAction({ class_id: classId, subject_id: subjectId, session_date: date });
      if (result.ok) {
        toast(`Marked ${result.data.count} students present`, 'success');
        // Refresh
        setRecords(students.map((s) => ({
          id: `tmp-${s.id}`, student_id: s.id, class_id: classId, subject_id: subjectId,
          session_date: date, status: 'PRESENT' as const, recorded_by_id: '', created_at: '', updated_at: '',
        })));
      } else {
        toast(result.error, 'error');
      }
    });
  };

  return (
    <div>
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Department"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            value={deptId}
            onChange={(v) => { setDeptId(v); setClassId(''); setSubjectId(''); }}
            placeholder="Select department"
          />
          <Select label="Class" options={classOptions} value={classId} onChange={setClassId} placeholder="Select class" />
          <Select label="Subject" options={subjectOptions} value={subjectId} onChange={setSubjectId} placeholder="Select subject" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {students.length > 0 && subjectId && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-700 dark:text-slate-200">{students.length}</span> students
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleMarkAll} disabled={pending}>
              <UserCheck className="w-4 h-4" /> Mark All Present
            </Button>
          </div>
        </div>
      )}

      {loading && <Card className="py-12 text-center text-sm text-slate-500">Loading…</Card>}

      {!loading && students.length > 0 && subjectId && (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase w-8">#</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Student</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student, i) => {
              const current = statusOf(student.id);
              return (
                <div key={student.id} className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <span className="text-sm text-slate-400 w-8">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{student.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.nim ?? student.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {STATUS_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => handleMark(student.id, o.value)}
                        disabled={pending}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200',
                          current === o.value ? o.active : o.inactive,
                          pending && 'opacity-70 cursor-wait',
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!loading && (!classId || !subjectId) && (
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
    </div>
  );
}
