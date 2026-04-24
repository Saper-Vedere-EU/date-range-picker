import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useDateRangePicker } from "./useDateRangePicker";

function setup(start?: Date, end?: Date) {
  const committedStart = ref<Date | undefined>(start);
  const committedEnd = ref<Date | undefined>(end);
  const picker = useDateRangePicker({ committedStart, committedEnd });
  return { picker, committedStart, committedEnd };
}

describe("useDateRangePicker", () => {
  describe("initial state", () => {
    it("starts in idle mode", () => {
      const { picker } = setup();
      expect(picker.mode.value).toBe("idle");
    });

    it("initializes left calendar to committed start month", () => {
      const { picker } = setup(new Date(2026, 2, 5)); // March 2026
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 });
    });

    it("shows committed range in idle mode", () => {
      const { picker } = setup(new Date(2026, 2, 5), new Date(2026, 2, 15));
      const allDays = picker.leftGrid.value.flat();
      const rangeStart = allDays.find((d) => d.isRangeStart);
      const rangeEnd = allDays.find((d) => d.isRangeEnd);
      const inRange = allDays.filter((d) => d.isInRange);

      expect(rangeStart?.dayOfMonth).toBe(5);
      expect(rangeEnd?.dayOfMonth).toBe(15);
      expect(inRange.length).toBe(9); // 6,7,8,9,10,11,12,13,14
    });
  });

  describe("idle → selecting", () => {
    it("transitions to selecting on day click", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10)); // April 10

      expect(picker.mode.value).toBe("selecting");
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 });
    });

    it("marks the anchor day as selected in the grid", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));

      const allDays = picker.leftGrid.value.flat();
      const selected = allDays.filter((d) => d.isSelected);
      expect(selected).toHaveLength(1);
      expect(selected[0].dayOfMonth).toBe(10);
    });
  });

  describe("selecting → selected", () => {
    it("transitions to selected on second day click", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));

      expect(picker.mode.value).toBe("selected");
    });

    it("orders dates chronologically", () => {
      const { picker } = setup();
      // Click later date first, then earlier
      picker.selectDay(new Date(2026, 3, 20));
      picker.selectDay(new Date(2026, 3, 5));

      expect(picker.mode.value).toBe("selected");
      const allDays = picker.leftGrid.value.flat();
      const rangeStart = allDays.find((d) => d.isRangeStart);
      const rangeEnd = allDays.find((d) => d.isRangeEnd);
      expect(rangeStart?.dayOfMonth).toBe(5);
      expect(rangeEnd?.dayOfMonth).toBe(20);
    });

    it("shows the full range highlight", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 15));

      const allDays = picker.leftGrid.value.flat();
      const inRange = allDays.filter((d) => d.isInRange);
      expect(inRange.length).toBe(4); // 11, 12, 13, 14
    });
  });

  describe("selected → idle (commit)", () => {
    it("updates committed values on commit", () => {
      const { picker, committedStart, committedEnd } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));
      picker.commit();

      expect(picker.mode.value).toBe("idle");
      expect(committedStart.value?.getDate()).toBe(10);
      expect(committedEnd.value?.getDate()).toBe(20);
    });
  });

  describe("selected → idle (reset)", () => {
    it("restores original committed values on reset", () => {
      const originalStart = new Date(2026, 2, 1);
      const originalEnd = new Date(2026, 2, 10);
      const { picker, committedStart, committedEnd } = setup(
        originalStart,
        originalEnd,
      );

      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));
      picker.reset();

      expect(picker.mode.value).toBe("idle");
      expect(committedStart.value).toBe(originalStart);
      expect(committedEnd.value).toBe(originalEnd);
    });
  });

  describe("selected → selecting", () => {
    it("clears range and sets new anchor on day click", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));
      expect(picker.mode.value).toBe("selected");

      picker.selectDay(new Date(2026, 4, 5)); // May 5
      expect(picker.mode.value).toBe("selecting");

      const allDays = picker.leftGrid.value.flat();
      const selected = allDays.filter((d) => d.isSelected);
      expect(selected).toHaveLength(1);
      expect(selected[0].dayOfMonth).toBe(5);

      const inRange = allDays.filter((d) => d.isInRange);
      expect(inRange).toHaveLength(0);
    });
  });

  describe("navigation in idle", () => {
    it("moves both calendars back together", () => {
      const { picker } = setup(new Date(2026, 3, 10));
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 });

      picker.navigatePrev();
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 });
    });

    it("moves both calendars forward together", () => {
      const { picker } = setup(new Date(2026, 3, 10));
      picker.navigateNext();
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 5 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 });
    });
  });

  describe("navigation in selecting (pinning)", () => {
    it("moves both when anchor stays visible", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 2, 5)); // March 5
      // left=March, right=April
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 });

      picker.navigatePrev();
      // left=Feb, right=March (anchor March 5 still visible in right)
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 2 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 });
    });

    it("pins right calendar when navigating prev would hide anchor", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 2, 5)); // March 5
      // left=March, right=April

      // First prev: left=Feb, right=March (anchor visible in right)
      picker.navigatePrev();
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 });

      // Second prev: anchor is in right(March), candidate right=Feb would hide it
      // So pin right(March), only left moves to Jan
      picker.navigatePrev();
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 1 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 3 });
    });

    it("pins left calendar when navigating next would hide anchor", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 2, 5)); // March 5
      // left=March, right=April

      // First next: left=April, right=May → anchor not visible in either candidate
      // Anchor is in left(March), so pin left, move right to May
      picker.navigateNext();
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 });
    });

    it("allows navigating next after pinning", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 2, 5)); // March 5
      // left=March, right=April

      picker.navigateNext(); // left=March(pinned), right=May
      picker.navigateNext(); // left=March(pinned), right=June
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 });
    });
  });

  describe("navigation in selected", () => {
    it("allows free navigation", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));

      picker.navigateNext();
      picker.navigateNext();
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 6 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 7 });
    });
  });

  describe("showViewSelection", () => {
    it("is false in idle and selecting modes", () => {
      const { picker } = setup();
      expect(picker.showViewSelection.value).toBe(false);

      picker.selectDay(new Date(2026, 3, 10));
      expect(picker.showViewSelection.value).toBe(false);
    });

    it("is false when range is visible", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));
      // Both dates are in April, which is in leftMonth
      expect(picker.showViewSelection.value).toBe(false);
    });

    it("is true when range is not visible after navigation", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));

      // Navigate far away
      picker.navigateNext();
      picker.navigateNext();
      picker.navigateNext();
      expect(picker.showViewSelection.value).toBe(true);
    });
  });

  describe("viewSelection", () => {
    it("repositions calendars to show the selection", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 4, 20)); // May 20

      // Navigate far away
      picker.navigateNext();
      picker.navigateNext();
      picker.navigateNext();

      picker.viewSelection();
      // start=April, end=May → left=April, right=May
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 });
    });

    it("handles same-month range", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20));

      picker.navigateNext();
      picker.navigateNext();
      picker.navigateNext();

      picker.viewSelection();
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 });
    });
  });

  describe("month picker", () => {
    it("starts with no month picker open", () => {
      const { picker } = setup();
      expect(picker.monthPickerSide.value).toBeNull();
    });

    it("opens month picker for left side", () => {
      const { picker } = setup();
      picker.openMonthPicker("left");
      expect(picker.monthPickerSide.value).toBe("left");
    });

    it("opens month picker for right side", () => {
      const { picker } = setup();
      picker.openMonthPicker("right");
      expect(picker.monthPickerSide.value).toBe("right");
    });

    it("toggles month picker off when clicking same side", () => {
      const { picker } = setup();
      picker.openMonthPicker("left");
      picker.openMonthPicker("left");
      expect(picker.monthPickerSide.value).toBeNull();
    });

    it("switches sides when clicking the other side", () => {
      const { picker } = setup();
      picker.openMonthPicker("left");
      picker.openMonthPicker("right");
      expect(picker.monthPickerSide.value).toBe("right");
    });

    it("selects a month on the left without conflict", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.openMonthPicker("left");
      picker.selectMonth("left", 3); // March
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 5 }); // unchanged
      expect(picker.monthPickerSide.value).toBeNull();
    });

    it("adjusts right when left month >= right month", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.selectMonth("left", 5); // May — same as right
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 5 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 6 }); // pushed to June
    });

    it("adjusts right when left month > right month", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.selectMonth("left", 10); // October — after right
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 10 });
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 11 }); // pushed to November
    });

    it("selects a month on the right without conflict", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.selectMonth("right", 8); // August
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 8 });
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 }); // unchanged
    });

    it("adjusts left when right month <= left month", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.selectMonth("right", 4); // April — same as left
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 4 });
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 3 }); // pushed to March
    });

    it("adjusts left when right month < left month", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.selectMonth("right", 2); // February — before left
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 2 });
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 1 }); // pushed to January
    });

    it("handles December wrap when adjusting right", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April, right=May
      picker.selectMonth("left", 12); // December
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 12 });
      expect(picker.rightMonth.value).toEqual({ year: 2027, month: 1 }); // January next year
    });

    it("handles January wrap when adjusting left", () => {
      const { picker } = setup(new Date(2026, 0, 10)); // left=January, right=February
      picker.selectMonth("right", 1); // January — same as left
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 1 });
      expect(picker.leftMonth.value).toEqual({ year: 2025, month: 12 }); // December prev year
    });

    it("works in selecting mode", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10)); // enter selecting mode
      expect(picker.mode.value).toBe("selecting");

      picker.selectMonth("left", 8);
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 8 });
    });

    it("works in selected mode", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 20)); // enter selected mode
      expect(picker.mode.value).toBe("selected");

      picker.selectMonth("right", 10);
      expect(picker.rightMonth.value).toEqual({ year: 2026, month: 10 });
    });
  });

  describe("year picker", () => {
    it("starts with no year picker open", () => {
      const { picker } = setup();
      expect(picker.yearPickerSide.value).toBeNull();
    });

    it("opens year picker for a side and seeds the decade window", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April 2026
      picker.openYearPicker("left");
      expect(picker.yearPickerSide.value).toBe("left");
      // Math.floor(2026 / 12) * 12 = 2016
      expect(picker.yearPickerBaseYear.value).toBe(2016);
    });

    it("toggles year picker off when clicking same side", () => {
      const { picker } = setup();
      picker.openYearPicker("left");
      picker.openYearPicker("left");
      expect(picker.yearPickerSide.value).toBeNull();
    });

    it("closes month picker when opening year picker", () => {
      const { picker } = setup();
      picker.openMonthPicker("left");
      expect(picker.monthPickerSide.value).toBe("left");

      picker.openYearPicker("left");
      expect(picker.monthPickerSide.value).toBeNull();
      expect(picker.yearPickerSide.value).toBe("left");
    });

    it("closes year picker when opening month picker", () => {
      const { picker } = setup();
      picker.openYearPicker("left");
      expect(picker.yearPickerSide.value).toBe("left");

      picker.openMonthPicker("left");
      expect(picker.yearPickerSide.value).toBeNull();
      expect(picker.monthPickerSide.value).toBe("left");
    });

    it("arrows shift the decade window by 12 years when year picker is open", () => {
      const { picker } = setup(new Date(2026, 3, 10));
      picker.openYearPicker("left");
      expect(picker.yearPickerBaseYear.value).toBe(2016);

      picker.navigateNext();
      expect(picker.yearPickerBaseYear.value).toBe(2028);
      // Calendars themselves don't move
      expect(picker.leftMonth.value).toEqual({ year: 2026, month: 4 });

      picker.navigatePrev();
      picker.navigatePrev();
      expect(picker.yearPickerBaseYear.value).toBe(2004);
    });

    it("selectYear updates the year, closes year picker, opens month picker", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April 2026
      picker.openYearPicker("left");
      picker.selectYear("left", 2030);

      expect(picker.leftMonth.value).toEqual({ year: 2030, month: 4 });
      expect(picker.yearPickerSide.value).toBeNull();
      expect(picker.monthPickerSide.value).toBe("left");
    });

    it("selectYear on left pushes right when left >= right", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April 2026, right=May 2026
      picker.selectYear("left", 2027); // left now April 2027, after right
      expect(picker.leftMonth.value).toEqual({ year: 2027, month: 4 });
      expect(picker.rightMonth.value).toEqual({ year: 2027, month: 5 });
    });

    it("selectYear on right pushes left when right <= left", () => {
      const { picker } = setup(new Date(2026, 3, 10)); // left=April 2026, right=May 2026
      picker.selectYear("right", 2025); // right now May 2025, before left
      expect(picker.rightMonth.value).toEqual({ year: 2025, month: 5 });
      expect(picker.leftMonth.value).toEqual({ year: 2025, month: 4 });
    });
  });

  describe("edge cases", () => {
    it("handles range spanning year boundary", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 11, 25)); // Dec 25
      picker.selectDay(new Date(2027, 0, 5)); // Jan 5

      expect(picker.mode.value).toBe("selected");

      const leftDays = picker.leftGrid.value.flat();
      const rightDays = picker.rightGrid.value.flat();
      const allDays = [...leftDays, ...rightDays];
      const rangeStart = allDays.find((d) => d.isRangeStart);
      const rangeEnd = allDays.find((d) => d.isRangeEnd);
      expect(rangeStart?.dayOfMonth).toBe(25);
      expect(rangeEnd?.dayOfMonth).toBe(5);
    });

    it("handles selecting same day twice", () => {
      const { picker } = setup();
      picker.selectDay(new Date(2026, 3, 10));
      picker.selectDay(new Date(2026, 3, 10));

      expect(picker.mode.value).toBe("selected");
      const allDays = picker.leftGrid.value.flat();
      const day10 = allDays.find(
        (d) => d.dayOfMonth === 10 && !d.isOutsideMonth,
      );
      expect(day10?.isRangeStart).toBe(true);
      expect(day10?.isRangeEnd).toBe(true);
    });
  });
});
