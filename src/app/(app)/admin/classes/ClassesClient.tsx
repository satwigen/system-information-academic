'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Dialog from '@/components/ui/Dialog';
import ConfirmButton from '@/components/domain/ConfirmButton';
import { useToast } from '@/components/ui/Toast';
import {
  createClassAction,
  updateClassAction,
  deleteClassAction,
} from '@/actions/classes';
import type { ClassRow, DepartmentRow } from '@/types/database';

interface Props {
  classes: ClassRow[];
  departments: DepartmentRow[];
}

export default function ClassesClient({ classes, departments }: Props) {
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [creating, setCreating] = useState(false);

  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? '—';

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" /> New Class
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_0.5fr_auto] px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
          <span>Name</span><span>Department</span><span>Semester</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {classes.map((c) => (
            <div key={c.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_0.5fr_auto] gap-2 px-4 md:px-6 py-3 items-center">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.name}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{deptName(c.department_id)}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Sem {c.semester}</span>
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setEditing(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <ConfirmButton
                  onConfirm={() => deleteClassAction(c.id)}
                  title={`Delete ${c.name}?`}
                  description="Deleting a class cascades attendance and materials."
                  small
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Editor open={creating} onClose={() => setCreating(false)} mode="create" departments={departments} />
      <Editor open={editing !== null} onClose={() => setEditing(null)} mode="edit" initial={editing ?? undefined} departments={departments} />
    </div>
  );
}

interface EditorProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initial?: ClassRow;
  departments: DepartmentRow[];
}

function Editor({ open, onClose, mode, initial, departments }: EditorProps) {
  const { toast } = useToast();
  const [deptId, setDeptId] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setDeptId(initial?.department_id ?? '');
      setName(initial?.name ?? '');
      setSemester(String(initial?.semester ?? 1));
    }
  }, [open, initial]);

  const canSubmit = deptId && name && semester;

  const submit = () => {
    startTransition(async () => {
      const payload = { department_id: deptId, name, semester: Number(semester) };
      const r = mode === 'create'
        ? await createClassAction(payload)
        : await updateClassAction(initial!.id, payload);
      if (r.ok) { toast('Saved', 'success'); onClose(); }
      else toast(r.error, 'error');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'New Class' : 'Edit Class'}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Department"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={deptId} onChange={setDeptId} placeholder="Select department"
          className="md:col-span-2"
        />
        <Input label="Semester" type="number" min={1} max={14} value={semester} onChange={(e) => setSemester(e.target.value)} />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="IT-1A" className="md:col-span-3" />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>{mode === 'create' ? 'Create' : 'Save'}</Button>
      </div>
    </Dialog>
  );
}
