import { ref, computed, type Ref } from "vue";
import type { PickerState, YearMonth, DayInfo, MonthGrid } from "./types";
import {
  isSameDay,
  isSameMonth,
  prevMonth,
  nextMonth,
  orderDates,
  generateMonthGrid,
  yearMonthFromDate,
} from "./calendar-utils";

export interface UseDateRangePickerOptions {
  committedStart: Ref<Date | undefined>;
  committedEnd: Ref<Date | undefined>;
}

export function useDateRangePicker(options: UseDateRangePickerOptions) {
  const { committedStart, committedEnd } = options;

  const mode = ref<PickerState>("idle");

  const today = new Date();
  const initialYm = committedStart.value
    ? yearMonthFromDate(committedStart.value)
    : yearMonthFromDate(today);

  const leftMonth = ref<YearMonth>({ ...initialYm });
  const rightMonth = ref<YearMonth>(nextMonth(initialYm));

  // selecting state
  const anchor = ref<Date | null>(null);

  // selected state
  const tentativeStart = ref<Date | null>(null);
  const tentativeEnd = ref<Date | null>(null);
  const committedStartSnapshot = ref<Date | undefined>(undefined);
  const committedEndSnapshot = ref<Date | undefined>(undefined);

  // --- Range computation ---

  const rangeStart = computed<Date | null>(() => {
    if (mode.value === "selected") return tentativeStart.value;
    if (mode.value === "idle" && committedStart.value && committedEnd.value) {
      return committedStart.value;
    }
    return null;
  });

  const rangeEnd = computed<Date | null>(() => {
    if (mode.value === "selected") return tentativeEnd.value;
    if (mode.value === "idle" && committedStart.value && committedEnd.value) {
      return committedEnd.value;
    }
    return null;
  });

  // --- Day info computation ---

  function computeDayInfo(date: Date, displayMonth: YearMonth): DayInfo {
    const rs = rangeStart.value;
    const re = rangeEnd.value;
    const dateTime = date.getTime();

    return {
      date,
      dayOfMonth: date.getDate(),
      isToday: isSameDay(date, today),
      isOutsideMonth:
        date.getFullYear() !== displayMonth.year ||
        date.getMonth() + 1 !== displayMonth.month,
      isSelected:
        mode.value === "selecting" &&
        anchor.value !== null &&
        isSameDay(date, anchor.value),
      isRangeStart: rs !== null && isSameDay(date, rs),
      isRangeEnd: re !== null && isSameDay(date, re),
      isInRange:
        rs !== null &&
        re !== null &&
        dateTime > rs.getTime() &&
        dateTime < re.getTime(),
      isDisabled: false,
    };
  }

  function buildGrid(ym: YearMonth): MonthGrid {
    const rawGrid = generateMonthGrid(ym.year, ym.month);
    return rawGrid.map((week) =>
      week.map((date) => computeDayInfo(date, ym)),
    );
  }

  const leftGrid = computed<MonthGrid>(() => buildGrid(leftMonth.value));
  const rightGrid = computed<MonthGrid>(() => buildGrid(rightMonth.value));

  // --- "Voir la sélection" ---

  const showViewSelection = computed<boolean>(() => {
    if (mode.value !== "selected") return false;
    const ts = tentativeStart.value;
    const te = tentativeEnd.value;
    if (!ts || !te) return false;
    const startVisible =
      isSameMonth(ts, leftMonth.value) || isSameMonth(ts, rightMonth.value);
    const endVisible =
      isSameMonth(te, leftMonth.value) || isSameMonth(te, rightMonth.value);
    return !startVisible || !endVisible;
  });

  // --- Actions ---

  function selectDay(date: Date) {
    if (mode.value === "idle" || mode.value === "selected") {
      // Transition to selecting
      anchor.value = date;
      tentativeStart.value = null;
      tentativeEnd.value = null;
      mode.value = "selecting";

      // Position calendars: anchor on left, next month on right
      const ym = yearMonthFromDate(date);
      leftMonth.value = { ...ym };
      rightMonth.value = nextMonth(ym);
    } else if (mode.value === "selecting") {
      // Transition to selected
      const [start, end] = orderDates(anchor.value!, date);
      tentativeStart.value = start;
      tentativeEnd.value = end;
      committedStartSnapshot.value = committedStart.value;
      committedEndSnapshot.value = committedEnd.value;
      anchor.value = null;
      mode.value = "selected";
    }
  }

  function navigatePrev() {
    if (mode.value === "idle" || mode.value === "selected") {
      leftMonth.value = prevMonth(leftMonth.value);
      rightMonth.value = prevMonth(rightMonth.value);
    } else if (mode.value === "selecting" && anchor.value) {
      const candidateLeft = prevMonth(leftMonth.value);
      const candidateRight = prevMonth(rightMonth.value);

      const anchorInCandidateLeft = isSameMonth(anchor.value, candidateLeft);
      const anchorInCandidateRight = isSameMonth(anchor.value, candidateRight);

      if (anchorInCandidateLeft || anchorInCandidateRight) {
        leftMonth.value = candidateLeft;
        rightMonth.value = candidateRight;
      } else {
        // Pin the calendar that currently shows the anchor
        if (isSameMonth(anchor.value, rightMonth.value)) {
          // Pin right, move left back
          leftMonth.value = prevMonth(leftMonth.value);
        } else {
          // Pin left, move right back
          rightMonth.value = prevMonth(rightMonth.value);
        }
      }
    }
  }

  function navigateNext() {
    if (mode.value === "idle" || mode.value === "selected") {
      leftMonth.value = nextMonth(leftMonth.value);
      rightMonth.value = nextMonth(rightMonth.value);
    } else if (mode.value === "selecting" && anchor.value) {
      const candidateLeft = nextMonth(leftMonth.value);
      const candidateRight = nextMonth(rightMonth.value);

      const anchorInCandidateLeft = isSameMonth(anchor.value, candidateLeft);
      const anchorInCandidateRight = isSameMonth(anchor.value, candidateRight);

      if (anchorInCandidateLeft || anchorInCandidateRight) {
        leftMonth.value = candidateLeft;
        rightMonth.value = candidateRight;
      } else {
        // Pin the calendar that currently shows the anchor
        if (isSameMonth(anchor.value, leftMonth.value)) {
          // Pin left, move right forward
          rightMonth.value = nextMonth(rightMonth.value);
        } else {
          // Pin right, move left forward
          leftMonth.value = nextMonth(leftMonth.value);
        }
      }
    }
  }

  function commit() {
    if (mode.value !== "selected") return;
    committedStart.value = tentativeStart.value ?? undefined;
    committedEnd.value = tentativeEnd.value ?? undefined;
    tentativeStart.value = null;
    tentativeEnd.value = null;
    mode.value = "idle";
  }

  function reset() {
    if (mode.value !== "selected") return;
    committedStart.value = committedStartSnapshot.value;
    committedEnd.value = committedEndSnapshot.value;
    tentativeStart.value = null;
    tentativeEnd.value = null;
    mode.value = "idle";
  }

  function viewSelection() {
    if (mode.value !== "selected") return;
    const ts = tentativeStart.value;
    const te = tentativeEnd.value;
    if (!ts || !te) return;

    const startYm = yearMonthFromDate(ts);
    const endYm = yearMonthFromDate(te);

    if (startYm.year === endYm.year && startYm.month === endYm.month) {
      // Same month: left = that month, right = next
      leftMonth.value = { ...startYm };
      rightMonth.value = nextMonth(startYm);
    } else {
      leftMonth.value = { ...startYm };
      rightMonth.value = { ...endYm };
    }
  }

  return {
    mode: computed(() => mode.value),
    leftMonth: computed(() => leftMonth.value),
    rightMonth: computed(() => rightMonth.value),
    leftGrid,
    rightGrid,
    showViewSelection,
    selectDay,
    navigatePrev,
    navigateNext,
    commit,
    reset,
    viewSelection,
  };
}
