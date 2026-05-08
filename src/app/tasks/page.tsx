'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, CheckSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressRing from '@/components/ui/ProgressRing';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { cn, formatDate } from '@/lib/utils';

export default function TasksPage() {
  const { user, role } = useAuth();
  const { tasks, subjects, classes, isTaskDone, toggleTaskDone, completions } = useData();

  // Students see tasks for their class; Dosen sees all their created tasks.
  const visible = useMemo(() => {
    if (role === 'STUDENT') {
      // Demo: show all tasks for demo student (user.classId = class-it-1a)
      return tasks.filter((t) => t.classId === (user.classId ?? 'class-it-1a'));
    }
    return tasks.filter((t) => t.createdById === user.id || role === 'DOSEN' || role === 'ADMIN' || role === 'HEAD');
  }, [tasks, role, user.classId, user.id]);

  const doneCount = visible.filter((t) => isTaskDone(t.id, user.id)).length;
  const progress = visible.length === 0 ? 0 : Math.round((doneCount / visible.length) * 100);

  return (
    <div>
      <Header title="Tasks" description="Your assignments and their progress." />

      {/* Progress summary */}
      <Card glass className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overall Progress</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {doneCount}
              <span className="text-lg font-medium text-slate-400">/{visible.length}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">tasks completed</p>
          </div>
          <ProgressRing value={progress} size={96} stroke={10} colorClass="text-emerald-500">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{progress}%</span>
          </ProgressRing>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((t) => {
          const subject = subjects.find((s) => s.id === t.subjectId);
          const cls = classes.find((c) => c.id === t.classId);
          const done = isTaskDone(t.id, user.id);
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={cn(
                  'relative overflow-hidden transition-all',
                  done && 'opacity-80 ring-1 ring-emerald-400/40'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskDone(t.id, user.id)}
                    aria-label={done ? 'Mark as not done' : 'Mark as done'}
                    className={cn(
                      'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                      done ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500 dark:text-slate-600'
                    )}
                  >
                    {done ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge>{subject?.code ?? 'Subject'}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{cls?.name}</span>
                    </div>
                    <h3
                      className={cn(
                        'text-sm font-semibold text-slate-900 dark:text-white',
                        done && 'line-through text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{t.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {formatDate(t.dueDate)}
                      </div>
                      {done ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                          <CheckSquare className="w-3 h-3 mr-1" /> Done
                        </Badge>
                      ) : (
                        <Badge>Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {done && <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500" />}
              </Card>
            </motion.div>
          );
        })}

        {visible.length === 0 && (
          <Card className="md:col-span-2 text-center py-16">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
