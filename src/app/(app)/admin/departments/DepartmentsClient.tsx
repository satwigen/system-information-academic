'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Building2, Users, BookOpen, Briefcase } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dialog from '@/components/ui/Dialog';
import Select from '@/components/ui/Select';
import ConfirmButton from '@/components/domain/ConfirmButton';
import { useToast } from '@/components/ui/Toast';
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from '@/actions/departments';
import type { DepartmentRow } from '@/types/database';

interface HeadLite { id: string; full_name: string }

interface Props {
  departments: DepartmentRow[];
  heads: HeadLite[];
  classCount: Record<string, number>;
  subjectCount: Record<string, number>;
}

export default function DepartmentsClient({ departments, heads, classCount, subjectCount }: Props) {
  const [editing, setEditing] = useState<DepartmentRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" /> New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {departments.map((d) => {
          const head = heads.find((h) => h.id === d.head_id);
          return (
            <Card key={d.id}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{d.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Code: {d.code}</p>
                </div>
              </div>
              {d.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{d.description}</p>}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                <Stat icon={<BookOpen className="w-3.5 h-3.5" />} label="Classes" value={classCount[d.id] ?? 0} />
                <Stat icon={<Briefcase className="w-3.5 h-3.5" />} label="Subjects" value={subjectCount[d.id] ?? 0} />
                <Stat icon={<Users className="w-3.5 h-3.5" />} label="Head" value={head ? 'Yes' : '—'} />
              </div>
              {head && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 truncate">Head: {head.full_name}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Button variant="secondary" size="sm" onClick={() => setEditing(d)}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
                <ConfirmButton
                  onConfirm={() => deleteDepartmentAction(d.id)}
                  title={`Delete ${d.name}?`}
                  description="This will fail if the department has classes or subjects."
                  small
                />
              </div>
            </Card>
          );
        })}
      </div>

      <Editor
        open={creating}
        onClose={() => setCreating(false)}
        heads={heads}
        mode="create"
      />
      <Editor
        open={editing !== null}
        onClose={() => setEditing(null)}
        heads={heads}
        mode="edit"
        initial={editing ?? undefined}
      />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">{icon}</div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{label}</p>
    </div>
  );
}

interface EditorProps {
  open: boolean;
  onClose: () => void;
  heads: HeadLite[];
  mode: 'create' | 'edit';
  initial?: DepartmentRow;
}

function Editor({ open, onClose, heads, mode, initial }: EditorProps) {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [headId, setHeadId] = useState('');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setCode(initial?.code ?? '');
      setName(initial?.name ?? '');
      setDescription(initial?.description ?? '');
      setIcon(initial?.icon ?? '');
      setHeadId(initial?.head_id ?? '');
    }
  }, [open, initial]);

  const canSubmit = code && name;

  const submit = () => {
    startTransition(async () => {
      const payload = {
        code,
        name,
        description: description || null,
        icon: icon || null,
        head_id: headId || null,
      };
      const r = mode === 'create'
        ? await createDepartmentAction(payload)
        : await updateDepartmentAction(initial!.id, payload);
      if (r.ok) { toast('Saved', 'success'); onClose(); }
      else toast(r.error, 'error');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'New Department' : 'Edit Department'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="IT" />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Information Technology" />
        <Input label="Icon (Lucide)" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Monitor" />
        <Select
          label="Head (optional)"
          options={heads.map((h) => ({ value: h.id, label: h.full_name }))}
          value={headId} onChange={setHeadId} placeholder="— No head —"
        />
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>{mode === 'create' ? 'Create' : 'Save'}</Button>
      </div>
    </Dialog>
  );
}
