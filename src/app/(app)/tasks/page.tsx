import { requireSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressRing from '@/components/ui/ProgressRing';
import TaskItem from './TaskItem';
import DosenTaskComposer from './DosenTaskComposer';
import { formatDate } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const { profile } = await requireSession();
  // HEAD does not see this page per PRD.
  if (profile.role === 'HEAD') redirect('/');

  const supabase = createClient();

  const [{ data: tasks }, { data: mine }, { data: classes }, { data: subjects }] = await Promise.all([
    supabase.from('tasks').select('*').order('due_date', { ascending: true }),
    profile.role === 'STUDENT'
      ? supabase.from('student_tasks').select('*').eq('user_id', profile.id)
      : Promise.resolve({ data: [] as any[] }),
    supabase.from('classes').select('*').order('name'),
    supabase.from('subjects').select('*').order('name'),
  ]);

  const done = new Set((mine ?? []).filter((c) => c.is_done).map((c) => c.task_id));
  const doneCount = done.size;
  const total = tasks?.length ?? 0;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div>
      <Header title="Tasks" description={profile.role === 'STUDENT' ? 'Your assignments and progress.' : 'Tasks you have assigned.'}>
        {(profile.role === 'DOSEN' || profile.role === 'ADMIN') && (
          <DosenTaskComposer classes={classes ?? []} subjects={subjects ?? []} />
        )}
      </Header>

      {profile.role === 'STUDENT' && (
        <Card glass className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overall Progress</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {doneCount}
                <span className="text-lg font-medium text-slate-400">/{total}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">tasks completed</p>
            </div>
            <ProgressRing value={progress} size={96} stroke={10} colorClass="text-emerald-500">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{progress}%</span>
            </ProgressRing>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(tasks ?? []).map((t) => {
          const subject = subjects?.find((s) => s.id === t.subject_id);
          const cls = classes?.find((c) => c.id === t.class_id);
          return (
            <TaskItem
              key={t.id}
              task={t}
              role={profile.role}
              subjectLabel={subject ? `${subject.code} · ${subject.name}` : 'Subject'}
              className={cls?.name ?? ''}
              dueLabel={formatDate(t.due_date)}
              isDone={done.has(t.id)}
              createdByMe={t.created_by_id === profile.id}
            />
          );
        })}
      </div>

      {(tasks?.length ?? 0) === 0 && (
        <Card className="text-center py-16">
          <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>
        </Card>
      )}
    </div>
  );
}
