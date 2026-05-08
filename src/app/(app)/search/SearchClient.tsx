'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import { roleBadgeColor, roleLabel } from '@/lib/rbac';
import type { ClassRow, DepartmentRow, ProfileRow, UserRole } from '@/types/database';

interface Props {
  departments: DepartmentRow[];
  classes: ClassRow[];
}

export default function SearchClient({ departments, classes }: Props) {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('');
  const [role, setRole] = useState<string>('');
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);
    let q = supabase
      .from('profiles')
      .select('*')
      .order('full_name')
      .limit(50);

    if (dept) q = q.eq('department_id', dept);
    if (role) q = q.eq('role', role as UserRole);
    if (query) q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,nim.ilike.%${query}%,nip.ilike.%${query}%`);

    q.then(({ data }) => {
      setResults(data ?? []);
      setLoading(false);
    });
  }, [query, dept, role]);

  const deptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? '—';
  const className = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by name, email, NIM, NIP..." />
          </div>
          <Select
            options={[
              { value: '', label: 'All Roles' },
              { value: 'STUDENT', label: 'Students' },
              { value: 'DOSEN', label: 'Lecturers' },
              { value: 'HEAD', label: 'Heads' },
              { value: 'ADMIN', label: 'Admins' },
            ]}
            value={role} onChange={setRole} placeholder="All Roles" className="min-w-[180px]"
          />
          <Select
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            value={dept} onChange={setDept} placeholder="All Departments" className="min-w-[200px]"
          />
        </div>
      </Card>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        {loading ? 'Loading…' : (
          <>
            Showing <span className="font-medium text-slate-700 dark:text-slate-200">{results.length}</span> people
          </>
        )}
      </p>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start gap-3">
                <Avatar name={p.full_name} src={p.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.full_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={roleBadgeColor(p.role)}>{roleLabel(p.role)}</Badge>
                    {p.nim && <span className="text-xs text-slate-400">NIM {p.nim}</span>}
                    {p.nip && <span className="text-xs text-slate-400">NIP {p.nip}</span>}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    {deptName(p.department_id)}
                    {p.class_id && <span> · {className(p.class_id)}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
