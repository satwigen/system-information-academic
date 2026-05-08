'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, mapDbError, type ActionResult } from '@/lib/action-result';
import { CreateTaskSchema, UpdateTaskSchema } from '@/lib/validation';
import type { TaskRow, StudentTaskRow } from '@/types/database';

export async function createTaskAction(
  input: unknown,
): Promise<ActionResult<TaskRow>> {
  const parsed = CreateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, created_by_id: user.id })
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/tasks');
  return ok(data);
}

export async function updateTaskAction(
  id: string,
  input: unknown,
): Promise<ActionResult<TaskRow>> {
  const parsed = UpdateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return fail('Invalid input', parsed.error.flatten().fieldErrors);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) return fail(mapDbError(error));
  revalidatePath('/tasks');
  return ok(data);
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return fail(mapDbError(error));
  revalidatePath('/tasks');
  return ok(null);
}

/**
 * Student-only: toggle their completion state on a task.
 * RLS blocks other roles from writing.
 */
export async function toggleTaskDoneAction(
  taskId: string,
): Promise<ActionResult<{ done: boolean }>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Not authenticated');

  // Read current state (if any).
  const { data: existing } = await supabase
    .from('student_tasks')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', user.id)
    .maybeSingle();

  const nextDone = !(existing?.is_done ?? false);

  const payload = {
    task_id: taskId,
    user_id: user.id,
    is_done: nextDone,
    done_at: nextDone ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from('student_tasks')
    .upsert(payload, { onConflict: 'task_id,user_id' });

  if (error) return fail(mapDbError(error));
  revalidatePath('/tasks');
  revalidatePath('/');
  return ok({ done: nextDone });
}
