'use client';

import React, { useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import SearchInput from '@/components/ui/SearchInput';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Role } from '@/lib/types';
import { getRoleBadgeColor, getRoleLabel } from '@/lib/utils';

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: '',        label: 'All Roles' },
  { value: 'ADMIN',   label: 'Admin' },
  { value: 'HEAD',    label: 'Head' },
  { value: 'DOSEN',   label: 'Dosen' },
  { value: 'STUDENT', label: 'Student' },
];

export default function AdminUsersPage() {
  const { role: currentRole, allUsers } = useAuth();
  const { students } = useData();

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Combine staff users + students into one table.
  const combined = useMemo(() => {
    const staff = allUsers.map((u) => ({
      id: u.id,
      name: u.profile.fullName,
      email: u.email,
      role: u.role as Role,
      subRef: u.deptId ?? u.classId ?? '—',
    }));
    const studs = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: 'STUDENT' as Role,
      subRef: s.classId,
    }));
    return [...staff, ...studs];
  }, [allUsers, students]);

  const filtered = useMemo(() => {
    let out = combined;
    if (roleFilter) out = out.filter((u) => u.role === roleFilter);
    if (query) {
      const q = query.toLowerCase();
      out = out.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return out;
  }, [combined, roleFilter, query]);

  if (currentRole !== 'ADMIN') return <AccessDenied />;

  return (
    <div>
      <Header title="User Management" description="Manage all users across the system.">
        <Badge className={getRoleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by name or email..." />
          </div>
          <Select
            options={ROLE_OPTIONS}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="All Roles"
            className="min-w-[200px]"
          />
        </div>
      </Card>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span> users
      </p>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr] px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
          <span>User</span><span>Email</span><span>Role</span><span>Reference</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.slice(0, 100).map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-1 md:grid-cols-[1.5fr_1.2fr_0.8fr_0.8fr] gap-2 px-4 md:px-6 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={u.name} size="sm" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{u.name}</span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{u.email}</span>
              <div>
                <Badge className={getRoleBadgeColor(u.role)}>{getRoleLabel(u.role)}</Badge>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.subRef}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AccessDenied() {
  return (
    <div>
      <Header title="Access Denied" description="This page is restricted to administrators." />
      <Card className="text-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Admin Access Required</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Switch to the Admin role using the role switcher to access this page.
          </p>
        </div>
      </Card>
    </div>
  );
}
