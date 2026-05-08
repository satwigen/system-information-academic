'use client';

import React, { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, CheckSquare, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { toggleTaskDoneAction, deleteTaskAction } from '@/actions/tasks';
import type { TaskRow, UserRole } from '@/types/database';

interface Props {
  task: TaskRow;
  role: UserRole;
  subjectLabel: string;
  className: string;
  dueLabel: string;
  isDone: boolean;
  createdByMe: boolean;
}

export default function TaskItem({ task, role, subjectLabel, className, dueLabel, isDone, createdByMe }: Props) {
  const { toast } = useToast();
  const [optimisticDone, setOptimisticDone] = useState(isDone);
  const [pending, startTransition] = useTransition();

  const canToggle = role === 'STUDENT';
  const canDelete = createdByMe || role === 'ADMIN';

  const handleToggle = () => {
    if (!canToggle) return;
    setOptimisticDone((v) => !v);
    startTransition(async () => {
      const result = await toggleTaskDoneAction(task.id);
      if (!result.ok) {
        setOptimisticDone(isDone);
        toast(result.error, 'error');
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('Delete this task?')) return;
    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (!result.ok) toast(result.error, 'error');
      else toast('Task deleted', 'success');
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn('relative overflow-hidden', optimisticDone && 'opacity-80 ring-1 ring-emerald-400/40')}>
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            disabled={!canToggle || pending}
            aria-label={optimisticDone ? 'Mark as not done' : 'Mark as done'}
            className={cn(
              'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
              optimisticDone ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500 dark:text-slate-600',
              !canToggle && 'cursor-default',
            )}
          >
            {optimisticDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge>{subjectLabel}</Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">{className}</span>
            </div>
            <h3 className={cn('text-sm font-semibold text-slate-900 dark:text-white', optimisticDone && 'line-through text-slate-500 dark:text-slate-400')}>
              {task.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                Due {dueLabel}
              </div>
              <div className="flex items-center gap-2">
                {optimisticDone ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckSquare className="w-3 h-3 mr-1" /> Done
                  </Badge>
                ) : (
                  <Badge>Pending</Badge>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={pending}
                    className="text-slate-400 hover:text-red-500 p-1"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {optimisticDone && <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500" />}
      </Card>
    </motion.div>
  );
}
