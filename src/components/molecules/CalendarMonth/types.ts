import type { MonthGrid } from "@/composables/useDateRangePicker/types";

export interface CalendarMonthProps {
  year: number;
  /** 1-indexed month */
  month: number;
  grid: MonthGrid;
  locale?: string;
  /** Whether the month picker grid is currently shown */
  monthPickerOpen?: boolean;
  /** Whether the year picker grid is currently shown */
  yearPickerOpen?: boolean;
  /** First year shown in the 12-year picker grid (top-left cell) */
  yearPickerBaseYear?: number;
  /** When false, day cells reject drag hovers and drops (defaults to true) */
  acceptsDrop?: boolean;
}
