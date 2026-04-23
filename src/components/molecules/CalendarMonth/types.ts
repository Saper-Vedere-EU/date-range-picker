import type { MonthGrid } from "@/composables/useDateRangePicker/types";

export interface CalendarMonthProps {
  year: number;
  /** 1-indexed month */
  month: number;
  grid: MonthGrid;
  locale?: string;
}
