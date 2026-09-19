import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";

export type CalendarDay = {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  pnl: number | null;
};

/**
 * Builds a 6-week grid (42 cells) for a given month.
 * Weeks start on Sunday. Extra days are filled with prev/next month days.
 */
export function buildMonthGrid(
  month: Date,
  dailyPnl: Record<string, number>
): CalendarDay[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Snap to start of first week and end of last week
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return allDays.map((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const pnl = dailyPnl[dateKey];
    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: isSameMonth(date, month),
      isToday: isToday(date),
      pnl: pnl !== undefined ? pnl : null,
    };
  });
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function getMonthOffset(date: Date, offset: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + offset);
  return d;
}