'use client';

import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, User, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import { useAttendance } from '@/context/AttendanceContext';
import { getAttendanceStats } from '@/lib/utils';

export default function SearchPage() {
  const { departments, classes, searchStudents, getRecordsByStudent } = useAttendance();

  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const results = useMemo(() => {
    return searchStudents(query, departmentFilter);
  }, [query, departmentFilter, searchStudents]);

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || '';
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || '';
  };

  const getDeptBadgeColor = (deptId: string) => {
    switch (deptId) {
      case 'dept-it': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dept-inf': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'dept-db': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div>
      <Header
        title="Search"
        description="Find students across all departments."
      />

      {/* Search & Filter Bar */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by student name or NIM..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={departments.map(d => ({ value: d.id, label: d.name }))}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="All Departments"
              className="w-56"
            />
            {(query || departmentFilter) && (
              <button
                onClick={() => { setQuery(''); setDepartmentFilter(''); }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{results.length}</span> students
          {query && <span> matching &ldquo;<span className="font-medium text-slate-700">{query}</span>&rdquo;</span>}
        </p>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.slice(0, 30).map((student) => {
            const studentRecords = getRecordsByStudent(student.id);
            const stats = getAttendanceStats(studentRecords);

            return (
              <Card key={student.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.nim}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDeptBadgeColor(student.departmentId)}`}>
                        {getDepartmentName(student.departmentId)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {getClassName(student.classId)}
                      </span>
                    </div>
                    {/* Attendance Mini Stats */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Attendance Rate</span>
                        <span className="text-sm font-semibold text-slate-800">{stats.rate}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex mt-1.5">
                        {stats.total > 0 && (
                          <>
                            <div className="h-full bg-emerald-500" style={{ width: `${(stats.present / stats.total) * 100}%` }} />
                            <div className="h-full bg-amber-400" style={{ width: `${(stats.late / stats.total) * 100}%` }} />
                            <div className="h-full bg-purple-400" style={{ width: `${(stats.sick / stats.total) * 100}%` }} />
                            <div className="h-full bg-red-400" style={{ width: `${(stats.absent / stats.total) * 100}%` }} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">No Results Found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Try adjusting your search query or filters to find the student you&apos;re looking for.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
