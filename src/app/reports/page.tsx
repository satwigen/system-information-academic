'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { useData } from '@/context/DataContext';
import { getAttendanceStats } from '@/lib/utils';

export default function ReportsPage() {
  const { departments, classes, students, records, getClassesByDepartment, getStudentsByClass } = useData();
  const [selectedDept, setSelectedDept] = useState('');

  const filteredClasses = useMemo(
    () => (selectedDept ? getClassesByDepartment(selectedDept) : classes),
    [selectedDept, classes, getClassesByDepartment]
  );

  const getClassReport = (classId: string) => getAttendanceStats(records.filter((r) => r.classId === classId));
  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name || '';

  return (
    <div>
      <Header title="Reports" description="Attendance summary and statistics for each class." />

      <Card className="mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <Select
            label="Filter by Department"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            value={selectedDept}
            onChange={setSelectedDept}
            placeholder="All Departments"
            className="min-w-[220px]"
          />
          {selectedDept && (
            <button
              onClick={() => setSelectedDept('')}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium pb-2.5"
            >
              Clear Filter
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{getAttendanceStats(records).rate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Overall Attendance Rate</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{students.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Students</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{records.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Records</p>
            </div>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Class Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredClasses.map((cls) => {
          const report = getClassReport(cls.id);
          const classStudents = getStudentsByClass(cls.id);

          return (
            <Card key={cls.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {getDeptName(cls.departmentId)} · Semester {cls.semester}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{report.rate}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">attendance</p>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-4">
                {report.total > 0 && (
                  <>
                    <div className="h-full bg-emerald-500" style={{ width: `${(report.present / report.total) * 100}%` }} />
                    <div className="h-full bg-amber-400"  style={{ width: `${(report.late    / report.total) * 100}%` }} />
                    <div className="h-full bg-violet-400" style={{ width: `${(report.sick    / report.total) * 100}%` }} />
                    <div className="h-full bg-red-400"    style={{ width: `${(report.absent  / report.total) * 100}%` }} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Present', color: 'bg-emerald-500', value: report.present },
                  { label: 'Late',    color: 'bg-amber-400',   value: report.late },
                  { label: 'Sick',    color: 'bg-violet-400',  value: report.sick },
                  { label: 'Absent',  color: 'bg-red-400',     value: report.absent },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-slate-600 dark:text-slate-300">{s.label}: {s.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {classStudents.length} students · {report.total} records
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
