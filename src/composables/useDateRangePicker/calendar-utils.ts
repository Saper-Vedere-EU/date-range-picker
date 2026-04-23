import type { YearMonth } from "./types";

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(date: Date, ym: YearMonth): boolean {
  return date.getFullYear() === ym.year && date.getMonth() + 1 === ym.month;
}

export function prevMonth(ym: YearMonth): YearMonth {
  if (ym.month === 1) {
    return { year: ym.year - 1, month: 12 };
  }
  return { year: ym.year, month: ym.month - 1 };
}

export function nextMonth(ym: YearMonth): YearMonth {
  if (ym.month === 12) {
    return { year: ym.year + 1, month: 1 };
  }
  return { year: ym.year, month: ym.month + 1 };
}

export function orderDates(a: Date, b: Date): [Date, Date] {
  return a.getTime() <= b.getTime() ? [a, b] : [b, a];
}

export function getMonthName(
  month: number,
  locale: string = "fr-FR",
): string {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleString(locale, { month: "long" });
}

export function getWeekdayNames(locale: string = "fr-FR"): string[] {
  const names: string[] = [];
  // 2024-01-01 is a Monday
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, 1 + i);
    names.push(date.toLocaleString(locale, { weekday: "short" }));
  }
  return names;
}

/**
 * Generates a 6×7 grid of Date objects for the given month.
 * Weeks start on Monday. Padding days from adjacent months fill the grid.
 */
export function generateMonthGrid(year: number, month: number): Date[][] {
  const grid: Date[][] = [];

  // First day of the month
  const firstDay = new Date(year, month - 1, 1);
  // Day of week: 0=Sun, 1=Mon... We want Mon=0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6; // Sunday → 6

  // Start date: go back to the Monday before or on the first day
  const startDate = new Date(year, month - 1, 1 - startDow);

  for (let row = 0; row < 6; row++) {
    const week: Date[] = [];
    for (let col = 0; col < 7; col++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + row * 7 + col);
      week.push(d);
    }
    grid.push(week);
  }

  return grid;
}

export function yearMonthFromDate(date: Date): YearMonth {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
