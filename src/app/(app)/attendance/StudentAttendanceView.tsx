import React from 'react';
import { CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDateJakarta } from '@/lib/time';
import type { AttendanceStatus } from '@/types/database';

/** Read-only view for students. RLS restricts to their own rows. */
export default async function StudentAttendanceView({ studentId }: { studentId: string }) {
  const supabase = createClient();

  const { data: rows } = await supabase
    .from('attendance_records')
    .select('*, subjects(name, code)')
    .eq('student_id', studentId)
    .order('session_date', { ascending: false })
    .limit(100);

  const records = rows ?? [];
  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const sick = records.filter((r) => r.status === 'SICK').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const rate = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

  return (
    <div>
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Your Attendance Rate</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{rate}%</p>
            <p className="text-xs text-slate-500 mt-1">{total} records total</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Present', color: 'bg-emerald-500', count: present },
              { label: 'Late',    color: 'bg-amber-500',   count: late },
              { label: 'Sick',    color: 'bg-violet-500',  count: sick },
              { label: 'Absent',  color: 'bg-red-500',     count: absent },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-slate-600 dark:text-slate-300">{s.label}: <strong>{s.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {records.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No attendance recorded yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Your attendance will appear here once your lecturer records it.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            <span>Subject</span><span>Date</span><span>Status</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((r) => (
              <div key={r.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 items-center">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {(r as any).subjects?.name ?? 'Subject'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(r as any).subjects?.code}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateJakarta(r.session_date)}
                </span>
                <Badge status={r.status as AttendanceStatus} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
