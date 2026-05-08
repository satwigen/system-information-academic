'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3, Printer, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import type { ClassRow, DepartmentRow, SubjectRow } from '@/types/database';

interface StatsRow {
  class_id: string;
  subject_id: string;
  total: number;
  present: number;
  late: number;
  sick: number;
  absent: number;
  rate_pct: number;
}

interface Props {
  departments: DepartmentRow[];
  classes: ClassRow[];
  subjects: SubjectRow[];
  stats: StatsRow[];
}

export default function ReportsClient({ departments, classes, subjects, stats }: Props) {
  const [deptId, setDeptId] = useState('');

  const filteredClasses = useMemo(
    () => (deptId ? classes.filter((c) => c.department_id === deptId) : classes),
    [deptId, classes],
  );

  const classLabel = (id: string) => classes.find((c) => c.id === id)?.name ?? '—';
  const subjectLabel = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';
  const deptLabel = (id: string) => departments.find((d) => d.id === id)?.name ?? '—';

  const byClass: Record<string, StatsRow[]> = {};
  for (const s of stats) {
    if (deptId) {
      const cls = classes.find((c) => c.id === s.class_id);
      if (cls?.department_id !== deptId) continue;
    }
    (byClass[s.class_id] ??= []).push(s);
  }

  const overall = stats.reduce(
    (acc, s) => {
      acc.total += s.total;
      acc.present += s.present;
      acc.late += s.late;
      acc.sick += s.sick;
      acc.absent += s.absent;
      return acc;
    },
    { total: 0, present: 0, late: 0, sick: 0, absent: 0 },
  );
  const overallRate = overall.total === 0
    ? 0
    : Math.round(((overall.present + overall.late) / overall.total) * 100);

  const handlePrint = () => window.print();
  const handlePdf = () => {
    const params = new URLSearchParams();
    if (deptId) params.set('department_id', deptId);
    window.open(`/api/reports/attendance-class/pdf?${params.toString()}`, '_blank');
  };

  return (
    <div>
      <Card className="mb-6 no-print">
        <div className="flex items-end gap-3 flex-wrap">
          <Select
            label="Filter by Department"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            value={deptId} onChange={setDeptId} placeholder="All Departments"
            className="min-w-[220px]"
          />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button onClick={handlePdf}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-8 print-block">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Overall Attendance Rate · {overall.total} records</p>
          </div>
        </div>
      </Card>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Class Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredClasses.map((cls) => {
          const perSubject = byClass[cls.id] ?? [];
          const totals = perSubject.reduce(
            (acc, r) => {
              acc.total += r.total;
              acc.present += r.present;
              acc.late += r.late;
              acc.sick += r.sick;
              acc.absent += r.absent;
              return acc;
            },
            { total: 0, present: 0, late: 0, sick: 0, absent: 0 },
          );
          const rate = totals.total === 0 ? 0 : Math.round(((totals.present + totals.late) / totals.total) * 100);
          return (
            <Card key={cls.id} className="print-block">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{cls.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {deptLabel(cls.department_id)} · Sem {cls.semester}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{rate}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">attendance</p>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-4">
                {totals.total > 0 && (
                  <>
                    <div className="h-full bg-emerald-500" style={{ width: `${(totals.present / totals.total) * 100}%` }} />
                    <div className="h-full bg-amber-400" style={{ width: `${(totals.late / totals.total) * 100}%` }} />
                    <div className="h-full bg-violet-400" style={{ width: `${(totals.sick / totals.total) * 100}%` }} />
                    <div className="h-full bg-red-400" style={{ width: `${(totals.absent / totals.total) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Present', color: 'bg-emerald-500', value: totals.present },
                  { label: 'Late',    color: 'bg-amber-400',   value: totals.late },
                  { label: 'Sick',    color: 'bg-violet-400',  value: totals.sick },
                  { label: 'Absent',  color: 'bg-red-400',     value: totals.absent },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-slate-600 dark:text-slate-300">{s.label}: {s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                {totals.total} records across {perSubject.length} subject(s)
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
