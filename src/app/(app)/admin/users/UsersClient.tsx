'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { Plus, Edit2, Key } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Dialog from '@/components/ui/Dialog';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import ConfirmButton from '@/components/domain/ConfirmButton';
import { useToast } from '@/components/ui/Toast';
import { roleBadgeColor, roleLabel } from '@/lib/rbac';
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  resetUserPasswordAction,
} from '@/actions/users';
import type {
  ProfileRow, DepartmentRow, ClassRow, UserRole,
} from '@/types/database';

interface Props {
  users: ProfileRow[];
  departments: DepartmentRow[];
  classes: ClassRow[];
}

export default function UsersClient({ users, departments, classes }: Props) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [editing, setEditing] = useState<ProfileRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState<ProfileRow | null>(null);

  const filtered = useMemo(() => {
    let out = users;
    if (roleFilter) out = out.filter((u) => u.role === roleFilter);
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.nim?.toLowerCase().includes(q) ?? false) ||
          (u.nip?.toLowerCase().includes(q) ?? false),
      );
    }
    return out;
  }, [users, query, roleFilter]);

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
              { value: 'ADMIN', label: 'Admin' },
              { value: 'HEAD', label: 'Head' },
              { value: 'DOSEN', label: 'Dosen' },
              { value: 'STUDENT', label: 'Student' },
            ]}
            value={roleFilter} onChange={setRoleFilter} placeholder="All Roles" className="min-w-[180px]"
          />
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> New User
          </Button>
        </div>
      </Card>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span> users
      </p>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_0.8fr_1.2fr_auto] px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
          <span>User</span><span>Email</span><span>Role</span><span>Reference</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((u) => (
            <div key={u.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_1.2fr_auto] gap-2 px-4 md:px-6 py-3 items-center">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{u.full_name}</p>
                  {u.nim && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">NIM {u.nim}</p>}
                  {u.nip && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">NIP {u.nip}</p>}
                </div>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{u.email}</span>
              <Badge className={roleBadgeColor(u.role)}>{roleLabel(u.role)}</Badge>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                <div className="truncate">{deptName(u.department_id)}</div>
                {u.class_id && <div className="truncate">{className(u.class_id)}</div>}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => setResetting(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Reset password">
                  <Key className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditing(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <ConfirmButton
                  onConfirm={() => deleteUserAction(u.id)}
                  title={`Delete ${u.full_name}?`}
                  description="This removes the auth user AND the profile row."
                  small
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Editor
        open={creating}
        onClose={() => setCreating(false)}
        mode="create"
        departments={departments}
        classes={classes}
      />
      <Editor
        open={editing !== null}
        onClose={() => setEditing(null)}
        mode="edit"
        initial={editing ?? undefined}
        departments={departments}
        classes={classes}
      />
      <PasswordResetDialog
        open={resetting !== null}
        onClose={() => setResetting(null)}
        user={resetting}
      />
    </div>
  );
}

// ------------- Create / Edit dialog -------------

interface EditorProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initial?: ProfileRow;
  departments: DepartmentRow[];
  classes: ClassRow[];
}

function Editor({ open, onClose, mode, initial, departments, classes }: EditorProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [deptId, setDeptId] = useState('');
  const [classId, setClassId] = useState('');
  const [nim, setNim] = useState('');
  const [nip, setNip] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setEmail(initial?.email ?? '');
      setPassword('');
      setFullName(initial?.full_name ?? '');
      setRole(initial?.role ?? 'STUDENT');
      setDeptId(initial?.department_id ?? '');
      setClassId(initial?.class_id ?? '');
      setNim(initial?.nim ?? '');
      setNip(initial?.nip ?? '');
      setPhone(initial?.phone ?? '');
      setAddress(initial?.address ?? '');
    }
  }, [open, initial]);

  const classOptions = useMemo(
    () => (deptId ? classes.filter((c) => c.department_id === deptId) : classes).map((c) => ({ value: c.id, label: c.name })),
    [deptId, classes],
  );

  const isStudent = role === 'STUDENT';
  const canSubmit =
    fullName && email && (mode === 'edit' || password.length >= 8) &&
    (!isStudent || (deptId && classId));

  const submit = () => {
    startTransition(async () => {
      if (mode === 'create') {
        const r = await createUserAction({
          email, password, full_name: fullName, role,
          department_id: deptId || null,
          class_id: isStudent ? (classId || null) : null,
          nim: nim || null,
          nip: nip || null,
          phone: phone || null,
          address: address || null,
        });
        if (r.ok) { toast('User created', 'success'); onClose(); }
        else toast(r.error, 'error');
      } else {
        const r = await updateUserAction(initial!.id, {
          full_name: fullName, role,
          department_id: deptId || null,
          class_id: isStudent ? (classId || null) : null,
          nim: nim || null,
          nip: nip || null,
          phone: phone || null,
          address: address || null,
        });
        if (r.ok) { toast('Saved', 'success'); onClose(); }
        else toast(r.error, 'error');
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'New User' : 'Edit User'} maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
        <Select
          label="Role"
          options={[
            { value: 'ADMIN', label: 'Admin' },
            { value: 'HEAD', label: 'Head' },
            { value: 'DOSEN', label: 'Dosen' },
            { value: 'STUDENT', label: 'Student' },
          ]}
          value={role} onChange={(v) => setRole(v as UserRole)}
        />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={mode === 'edit'} />
        {mode === 'create' && (
          <Input label="Initial Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 chars" />
        )}
        <Select
          label="Department"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={deptId} onChange={(v) => { setDeptId(v); setClassId(''); }}
          placeholder="— None —"
        />
        {isStudent && (
          <Select
            label="Class"
            options={classOptions}
            value={classId} onChange={setClassId}
            placeholder={deptId ? 'Select class' : 'Select department first'}
            disabled={!deptId}
          />
        )}
        {isStudent && (
          <Input label="NIM" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Student ID" />
        )}
        {!isStudent && (
          <Input label="NIP" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Staff ID" />
        )}
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="md:col-span-2" />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>{mode === 'create' ? 'Create' : 'Save'}</Button>
      </div>
    </Dialog>
  );
}

// ------------- Password reset dialog -------------

interface PwProps {
  open: boolean;
  onClose: () => void;
  user: ProfileRow | null;
}

function PasswordResetDialog({ open, onClose, user }: PwProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => { if (open) setPassword(''); }, [open]);

  const submit = () => {
    if (!user) return;
    startTransition(async () => {
      const r = await resetUserPasswordAction(user.id, { newPassword: password });
      if (r.ok) { toast(`Password reset for ${user.full_name}`, 'success'); onClose(); }
      else toast(r.error, 'error');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Reset Password" description={user ? `For ${user.full_name}` : ''}>
      <Input
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="min 8 characters"
      />
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={submit} disabled={password.length < 8 || pending}>Reset</Button>
      </div>
    </Dialog>
  );
}
