'use client';

import React, { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { createTaskAction } from '@/actions/tasks';
import type { ClassRow, SubjectRow } from '@/types/database';

interface Props {
  classes: ClassRow[];
  subjects: SubjectRow[];
}

export default function DosenTaskComposer({ classes, subjects }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const canSubmit = classId && subjectId && title && description && dueDate;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const iso = new Date(dueDate + 'T23:59:00').toISOString();
    startTransition(async () => {
      const result = await createTaskAction({
        class_id: classId, subject_id: subjectId, title, description, due_date: iso,
      });
      if (result.ok) {
        toast('Task created', 'success');
        setOpen(false);
        setTitle(''); setDescription(''); setDueDate('');
      } else {
        toast(result.error, 'error');
      }
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> New Task
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="New Task" description="Assign a task to a class.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            value={classId} onChange={setClassId} placeholder="Select class"
          />
          <Select
            label="Subject"
            options={subjects.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
            value={subjectId} onChange={setSubjectId} placeholder="Select subject"
          />
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly assignment" />
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Instructions..."
              className="w-full mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || pending}>Create</Button>
        </div>
      </Dialog>
    </>
  );
}
