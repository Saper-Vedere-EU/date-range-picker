export interface CalendarMonthCellProps {
  /** 1-indexed month number */
  month: number;
  /** Display label (e.g. "janv.", "févr.") */
  label: string;
  /** Whether this is the currently displayed month */
  isCurrent: boolean;
}
