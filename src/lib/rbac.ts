import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Search,
  Users,
  Building2,
  DoorOpen,
  FileText,
  Megaphone,
  CheckSquare,
  UserCircle,
  BookOpen,
  School,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/database';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  primary?: boolean; // shown in mobile dock
}

/**
 * Per PRD v3.0 corrections:
 *  - HEAD does NOT see Materials, Tasks, or Attendance.
 *  - STUDENT sees Attendance (read-only), Tasks, Materials, Feed.
 *  - DOSEN sees Attendance, Materials, Tasks (create/edit), Feed, Reports, Search.
 *  - ADMIN sees everything.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/attendance', label: 'Attendance', icon: ClipboardList, roles: ['ADMIN', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/materials', label: 'Materials', icon: FileText, roles: ['ADMIN', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/feed', label: 'Feed', icon: Megaphone, roles: ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, roles: ['ADMIN', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'HEAD', 'DOSEN'] },
  { href: '/search', label: 'Search', icon: Search, roles: ['ADMIN', 'HEAD', 'DOSEN'] },
  { href: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/admin/departments', label: 'Departments', icon: Building2, roles: ['ADMIN'] },
  { href: '/admin/classes', label: 'Classes', icon: School, roles: ['ADMIN'] },
  { href: '/admin/subjects', label: 'Courses', icon: BookOpen, roles: ['ADMIN'] },
  { href: '/admin/rooms', label: 'Rooms', icon: DoorOpen, roles: ['ADMIN'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'] },
];

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}

/** Used by middleware to block role-scoped paths. */
export function canAccess(role: UserRole, pathname: string): boolean {
  // Admin-only prefix
  if (pathname.startsWith('/admin')) return role === 'ADMIN';

  // Role-specific screen gates
  const item = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + '/'),
  );
  if (!item) return true; // default allow; deeper routes handle their own checks
  return item.roles.includes(role);
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN':   return 'Administrator';
    case 'HEAD':    return 'Head of Department';
    case 'DOSEN':   return 'Lecturer (Dosen)';
    case 'STUDENT': return 'Student';
  }
}

export function roleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'ADMIN':   return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'HEAD':    return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    case 'DOSEN':   return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'STUDENT': return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800';
  }
}
