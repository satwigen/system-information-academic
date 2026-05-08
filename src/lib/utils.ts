import { AttendanceRecord, AttendanceStatus, Role } from './types';

// -------------------- Attendance helpers --------------------
export function getAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  if (total === 0) return { present: 0, late: 0, sick: 0, absent: 0, rate: 0, total: 0 };

  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const sick = records.filter((r) => r.status === 'sick').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const rate = Math.round(((present + late) / total) * 100);

  return { present, late, sick, absent, rate, total };
}

export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'late':
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'sick':
      return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    case 'absent':
      return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  }
}

export function getStatusDotColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'bg-emerald-500';
    case 'late':
      return 'bg-amber-500';
    case 'sick':
      return 'bg-violet-500';
    case 'absent':
      return 'bg-red-500';
  }
}

export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'Present';
    case 'late':
      return 'Late';
    case 'sick':
      return 'Sick';
    case 'absent':
      return 'Absent';
  }
}

// -------------------- Role helpers --------------------
export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'HEAD':
      return 'Head of Department';
    case 'DOSEN':
      return 'Faculty / Dosen';
    case 'STUDENT':
      return 'Student';
  }
}

export function getRoleBadgeColor(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'HEAD':
      return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    case 'DOSEN':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'STUDENT':
      return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800';
  }
}

// -------------------- Date helpers --------------------
// HYDRATION-SAFE: these helpers accept a date argument.
// Never call them at module scope.
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelative(date: string): string {
  const then = new Date(date).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

// -------------------- Misc --------------------
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
