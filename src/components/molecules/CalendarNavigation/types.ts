import type { MonthGrid } from "@/composables/useDateRangePicker/types";

export interface CalendarNavigationProps {
  leftYear: number;
  leftMonth: number;
  leftGrid: MonthGrid;
  rightYear: number;
  rightMonth: number;
  rightGrid: MonthGrid;
  locale?: string;
}
