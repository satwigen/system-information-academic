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
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
} from '@/actions/subjects';
import type { SubjectRow, DepartmentRow } from '@/types/database';

interface Props {
  subjects: SubjectRow[];
  departments: DepartmentRow[];
}

export default function SubjectsClient({ subjects, departments }: Props) {
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [creating, setCreating] = useState(false);
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? '—';

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New Course</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[0.6fr_1.5fr_1fr_0.4fr_auto] px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
          <span>Code</span><span>Name</span><span>Department</span><span>Credits</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {subjects.map((s) => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-[0.6fr_1.5fr_1fr_0.4fr_auto] gap-2 px-4 md:px-6 py-3 items-center">
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{s.code}</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.name}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{deptName(s.department_id)}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{s.credits} sks</span>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => setEditing(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <ConfirmButton onConfirm={() => deleteSubjectAction(s.id)} title={`Delete ${s.name}?`} small />
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
  open: boolean; onClose: () => void; mode: 'create' | 'edit';
  initial?: SubjectRow; departments: DepartmentRow[];
}

function Editor({ open, onClose, mode, initial, departments }: EditorProps) {
  const { toast } = useToast();
  const [deptId, setDeptId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setDeptId(initial?.department_id ?? '');
      setCode(initial?.code ?? '');
      setName(initial?.name ?? '');
      setCredits(String(initial?.credits ?? 3));
    }
  }, [open, initial]);

  const canSubmit = deptId && code && name && credits;
  const submit = () => {
    startTransition(async () => {
      const payload = { department_id: deptId, code, name, credits: Number(credits) };
      const r = mode === 'create'
        ? await createSubjectAction(payload)
        : await updateSubjectAction(initial!.id, payload);
      if (r.ok) { toast('Saved', 'success'); onClose(); }
      else toast(r.error, 'error');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'New Course' : 'Edit Course'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="IT201" />
        <Input label="Credits" type="number" min={1} max={10} value={credits} onChange={(e) => setCredits(e.target.value)} />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Web Development" className="md:col-span-2" />
        <Select
          label="Department"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          value={deptId} onChange={setDeptId} placeholder="Select department"
          className="md:col-span-2"
        />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>{mode === 'create' ? 'Create' : 'Save'}</Button>
      </div>
    </Dialog>
  );
}
