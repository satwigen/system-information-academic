/**
 * Time utilities. All business logic uses Asia/Jakarta (UTC+7).
 *
 * Hydration-safe rules:
 *  - Pure formatters (formatDate, formatDateJakarta) are deterministic for a
 *    given ISO input.
 *  - `formatRelative` reads `Date.now()` and MUST only be rendered inside a
 *    <ClientOnly> wrapper.
 *  - `getJakartaNow` is a server-side helper; never call it in a client
 *    component during render.
 */

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

export function jakartaDateFrom(d: Date = new Date()): Date {
  return new Date(d.getTime() + JAKARTA_OFFSET_MS);
}

/**
 * Returns the current "wall clock" in Jakarta as {day, hhmm, date}.
 * - day:   0..6 (0 = Sunday), matching Postgres DOW
 * - hhmm:  "HH:MM" 24-hour
 * - date:  "YYYY-MM-DD" Jakarta-local date
 */
export function getJakartaNow(now: Date = new Date()): {
  day: number;
  hhmm: string;
  date: string;
} {
  const j = jakartaDateFrom(now);
  const day = j.getUTCDay();
  const hh = String(j.getUTCHours()).padStart(2, '0');
  const mm = String(j.getUTCMinutes()).padStart(2, '0');
  const yyyy = j.getUTCFullYear();
  const mo = String(j.getUTCMonth() + 1).padStart(2, '0');
  const d = String(j.getUTCDate()).padStart(2, '0');
  return { day, hhmm: `${hh}:${mm}`, date: `${yyyy}-${mo}-${d}` };
}

export function todayJakarta(): string {
  return getJakartaNow().date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** UTC-based formatter: identical output on any server or client. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Jakarta-local calendar date from an ISO string, e.g. "Mon, Nov 10, 2025". */
export function formatDateJakarta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const j = jakartaDateFrom(d);
  return `${WEEKDAYS[j.getUTCDay()]}, ${MONTHS[j.getUTCMonth()]} ${j.getUTCDate()}, ${j.getUTCFullYear()}`;
}

/** Use only inside <ClientOnly>. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
}

export function dayName(dow: number): string {
  return WEEKDAYS_LONG[dow] ?? '';
}

export function dayShort(dow: number): string {
  return WEEKDAYS[dow] ?? '';
}

/**
 * Normalize a time string to "HH:MM". Accepts "HH:MM" or "HH:MM:SS".
 */
export function normalizeTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

/**
 * Format a time column value for display (strips seconds).
 */
export function formatTime(t: string): string {
  return normalizeTime(t);
}

/**
 * Given a weekly room-mapping slot (day_of_week, end_time), decide whether the
 * session has finished in Jakarta-local wall-clock time.
 *
 * NOTE: Postgres `time` columns serialize as "HH:MM:SS". We normalize both
 * sides to "HH:MM" before the string comparison so the inequality is correct.
 *
 * Only expires on the same day of the week, after end_time. Future days of
 * the week (e.g., Wednesday when today is Monday) remain visible until their
 * own day turns stale.
 */
export function isRoomSlotExpired(
  dayOfWeek: number,
  endTime: string,
  now: Date = new Date(),
): boolean {
  const j = getJakartaNow(now);
  if (j.day !== dayOfWeek) return false;
  return j.hhmm >= normalizeTime(endTime);
}

/**
 * Returns an ordered list of weekly slots that have NOT yet expired, starting
 * with the rest of today, followed by tomorrow, and so on for a 7-day window.
 */
export function sortUpcomingSlots<T extends { day_of_week: number; start_time: string; end_time: string }>(
  slots: T[],
  now: Date = new Date(),
): T[] {
  const j = getJakartaNow(now);
  const todayDay = j.day;
  const todayHHMM = j.hhmm;

  // Assign a sort key: days from today, with expired slots pushed to the end.
  const withKey = slots.map((slot) => {
    const dayDelta = (slot.day_of_week - todayDay + 7) % 7;
    const expiredToday =
      dayDelta === 0 && normalizeTime(slot.end_time) <= todayHHMM;
    return { slot, dayDelta, expiredToday };
  });

  // Expired-today goes to the end (push by full 7-day cycle).
  withKey.sort((a, b) => {
    const aKey = a.expiredToday ? 7 : a.dayDelta;
    const bKey = b.expiredToday ? 7 : b.dayDelta;
    if (aKey !== bKey) return aKey - bKey;
    return normalizeTime(a.slot.start_time).localeCompare(normalizeTime(b.slot.start_time));
  });

  // Drop expired-today entirely from the upcoming list.
  return withKey.filter((w) => !w.expiredToday).map((w) => w.slot);
}
