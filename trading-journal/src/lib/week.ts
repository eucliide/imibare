import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  getISOWeek,
  format,
} from "date-fns";

// All week boundaries use Monday as the first day (ISO 8601)
const WEEK_OPTIONS = { weekStartsOn: 1 as const };

/**
 * Returns Monday 00:00:00.000 UTC of the week containing `date`.
 * We work in UTC throughout to keep weekStart values consistent
 * regardless of the server's local timezone.
 */
export function getWeekStart(date: Date): Date {
  // startOfWeek operates on local time, so we normalise to UTC midnight first.
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const start = startOfWeek(utc, WEEK_OPTIONS);
  return new Date(
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  );
}

/**
 * Returns Sunday 23:59:59.999 UTC of the week containing `date`.
 */
export function getWeekEnd(date: Date): Date {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const end = endOfWeek(utc, WEEK_OPTIONS);
  return new Date(
    Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23,
      59,
      59,
      999
    )
  );
}

/**
 * Shifts a date by N weeks (positive = future, negative = past).
 */
export function getWeekOffset(date: Date, weeks: number): Date {
  return addWeeks(date, weeks);
}

/**
 * Formats a week range as "Sep 22 – Sep 28, 2026".
 * `start` must be the Monday of the week.
 */
export function formatWeekRange(start: Date): string {
  const end = getWeekEnd(start);
  const startStr = format(start, "MMM d");
  const endStr = format(end, "MMM d, yyyy");
  return `${startStr} – ${endStr}`;
}

/**
 * Returns true if `date` falls in the current ISO week.
 */
export function isCurrentWeek(date: Date): boolean {
  const now = getWeekStart(new Date());
  const target = getWeekStart(date);
  return now.getTime() === target.getTime();
}

/**
 * Returns the ISO 8601 week number (1–53) for a given date.
 */
export function getIsoWeekNumber(date: Date): number {
  return getISOWeek(date);
}

/**
 * Serialises a week-start Date to a YYYY-MM-DD string for use in URLs.
 */
export function weekToParam(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Parses a YYYY-MM-DD param back to a UTC midnight Date.
 * Returns null if the string is not a valid date.
 */
export function paramToWeekStart(param: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(date.getTime())) return null;
  // Snap to the Monday of that week so a bad param still lands correctly
  return getWeekStart(date);
}
