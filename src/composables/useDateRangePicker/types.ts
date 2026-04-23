export type PickerState = "idle" | "selecting" | "selected";

export interface YearMonth {
  year: number;
  /** 1-indexed (1 = January, 12 = December) */
  month: number;
}

export interface DayInfo {
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  isOutsideMonth: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
}

/** 6 rows × 7 columns */
export type MonthGrid = DayInfo[][];
