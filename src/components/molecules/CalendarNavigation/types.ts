import type { MonthGrid } from "@/composables/useDateRangePicker/types";

export interface CalendarNavigationProps {
  leftYear: number;
  leftMonth: number;
  leftGrid: MonthGrid;
  rightYear: number;
  rightMonth: number;
  rightGrid: MonthGrid;
  locale?: string;
  /** Which side has the month picker open (null = none) */
  monthPickerSide?: "left" | "right" | null;
}
