import { Role } from './types';
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
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
  primary?: boolean; // shown in mobile dock
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/attendance', label: 'Attendance', icon: ClipboardList, roles: ['DOSEN', 'STUDENT'], primary: true },
  { href: '/materials', label: 'Materials', icon: FileText, roles: ['DOSEN', 'STUDENT', 'HEAD'], primary: true },
  { href: '/feed', label: 'Feed', icon: Megaphone, roles: ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'], primary: true },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, roles: ['STUDENT', 'DOSEN'], primary: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'HEAD'] },
  { href: '/search', label: 'Search', icon: Search, roles: ['ADMIN', 'HEAD', 'DOSEN'] },
  { href: '/admin/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/admin/departments', label: 'Departments', icon: Building2, roles: ['ADMIN'] },
  { href: '/admin/rooms', label: 'Room Mapping', icon: DoorOpen, roles: ['ADMIN'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'] },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function canAccess(role: Role, path: string): boolean {
  const item = NAV_ITEMS.find((n) => path === n.href || path.startsWith(n.href + '/'));
  return item ? item.roles.includes(role) : true;
}
