export interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isOutsideMonth: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  /** When false, this day rejects drag hovers and drops (defaults to true) */
  acceptsDrop?: boolean;
}
