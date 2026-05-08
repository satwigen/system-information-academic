'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { useAttendance } from '@/context/AttendanceContext';
import { getAttendanceStats } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types';

export default function ReportsPage() {
  const { departments, classes, students, records, getClassesByDepartment, getStudentsByClass } = useAttendance();

  const [selectedDept, setSelectedDept] = useState('');

  const filteredClasses = useMemo(() => {
    if (!selectedDept) return classes;
    return getClassesByDepartment(selectedDept);
  }, [selectedDept, classes, getClassesByDepartment]);

  const getClassReport = (classId: string) => {
    const classRecords = records.filter(r => r.classId === classId);
    return getAttendanceStats(classRecords);
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || '';
  };

  return (
    <div>
      <Header
        title="Reports"
        description="View attendance summary and statistics for each class."
      />

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-end gap-4">
          <Select
            label="Filter by Department"
            options={departments.map(d => ({ value: d.id, label: d.name }))}
            value={selectedDept}
            onChange={setSelectedDept}
            placeholder="All Departments"
            className="w-64"
          />
          {selectedDept && (
            <button
              onClick={() => setSelectedDept('')}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium pb-2.5"
            >
              Clear Filter
            </button>
          )}
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {getAttendanceStats(records).rate}%
              </p>
              <p className="text-xs text-slate-500">Overall Attendance Rate</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{students.length}</p>
              <p className="text-xs text-slate-500">Total Students Tracked</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{records.length}</p>
              <p className="text-xs text-slate-500">Total Records</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Class Reports */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Class Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const report = getClassReport(cls.id);
          const classStudents = getStudentsByClass(cls.id);

          return (
            <Card key={cls.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getDepartmentName(cls.departmentId)} &middot; Semester {cls.semester}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{report.rate}%</p>
                  <p className="text-xs text-slate-500">attendance</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex mb-4">
                {report.total > 0 && (
                  <>
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(report.present / report.total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${(report.late / report.total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-purple-400 transition-all"
                      style={{ width: `${(report.sick / report.total) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-400 transition-all"
                      style={{ width: `${(report.absent / report.total) * 100}%` }}
                    />
                  </>
                )}
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">Present: {report.present}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="text-slate-600">Late: {report.late}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                  <span className="text-slate-600">Sick: {report.sick}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <span className="text-slate-600">Absent: {report.absent}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  {classStudents.length} students &middot; {report.total} records
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
