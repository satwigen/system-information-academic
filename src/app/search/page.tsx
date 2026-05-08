'use client';

import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import SearchInput from '@/components/ui/SearchInput';
import { useData } from '@/context/DataContext';
import { getAttendanceStats } from '@/lib/utils';

export default function SearchPage() {
  const { departments, classes, searchStudents, getRecordsByStudent } = useData();
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const results = useMemo(() => searchStudents(query, departmentFilter), [query, departmentFilter, searchStudents]);
  const getDept = (id: string) => departments.find((d) => d.id === id)?.name || '';
  const getClass = (id: string) => classes.find((c) => c.id === id)?.name || '';

  const deptBadge = (id: string) => {
    switch (id) {
      case 'dept-it':  return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
      case 'dept-inf': return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
      case 'dept-db':  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      default:         return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div>
      <Header title="Search" description="Find students across all departments." />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by student name or NIM..." />
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="All Departments"
              className="min-w-[200px]"
            />
            {(query || departmentFilter) && (
              <button
                onClick={() => { setQuery(''); setDepartmentFilter(''); }}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-medium text-slate-700 dark:text-slate-200">{results.length}</span> students
          {query && <> matching &ldquo;<span className="font-medium text-slate-700 dark:text-slate-200">{query}</span>&rdquo;</>}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.slice(0, 30).map((student) => {
            const stats = getAttendanceStats(getRecordsByStudent(student.id));
            return (
              <Card key={student.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{student.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.nim}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${deptBadge(student.departmentId)}`}>
                        {getDept(student.departmentId)}
                      </span>
                      <span className="text-xs text-slate-400">{getClass(student.classId)}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Attendance Rate</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stats.rate}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mt-1.5">
                        {stats.total > 0 && (
                          <>
                            <div className="h-full bg-emerald-500" style={{ width: `${(stats.present / stats.total) * 100}%` }} />
                            <div className="h-full bg-amber-400"  style={{ width: `${(stats.late    / stats.total) * 100}%` }} />
                            <div className="h-full bg-violet-400" style={{ width: `${(stats.sick    / stats.total) * 100}%` }} />
                            <div className="h-full bg-red-400"    style={{ width: `${(stats.absent  / stats.total) * 100}%` }} />
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
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No Results Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Try adjusting your search query or filters.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
