export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/**
 * Translates low-level DB errors to user-safe messages.
 * Extend as new common codes show up.
 */
export function mapDbError(error: { code?: string; message: string } | null | undefined): string {
  if (!error) return 'Unknown error';
  switch (error.code) {
    case '23505': return 'Already exists';
    case '23503': return 'Referenced record not found';
    case '42501': return 'Forbidden';
    default:      return error.message || 'Server error';
  }
}
