import { AttendanceRecord, AttendanceStatus } from './types';

export function getAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  if (total === 0) return { present: 0, late: 0, sick: 0, absent: 0, rate: 0 };

  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;
  const sick = records.filter(r => r.status === 'sick').length;
  const absent = records.filter(r => r.status === 'absent').length;

  const rate = Math.round(((present + late) / total) * 100);

  return { present, late, sick, absent, rate, total };
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'late': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'sick': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'absent': return 'bg-red-100 text-red-700 border-red-200';
  }
}

export function getStatusDotColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'bg-emerald-500';
    case 'late': return 'bg-amber-500';
    case 'sick': return 'bg-purple-500';
    case 'absent': return 'bg-red-500';
  }
}

export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'Present';
    case 'late': return 'Late';
    case 'sick': return 'Sick';
    case 'absent': return 'Absent';
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
