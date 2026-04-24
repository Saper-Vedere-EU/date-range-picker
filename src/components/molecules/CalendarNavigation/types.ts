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
  /** Which side has the year picker open (null = none) */
  yearPickerSide?: "left" | "right" | null;
  /** First year shown in the 12-year picker grid (top-left cell) */
  yearPickerBaseYear?: number;
  /** Side the active drag originated from (null = no drag) */
  dragSourceSide?: "left" | "right" | null;
}
