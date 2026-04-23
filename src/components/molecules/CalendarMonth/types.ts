import type { MonthGrid } from "@/composables/useDateRangePicker/types";

export interface CalendarMonthProps {
  year: number;
  /** 1-indexed month */
  month: number;
  grid: MonthGrid;
  locale?: string;
  /** Whether the month picker grid is currently shown */
  monthPickerOpen?: boolean;
}
