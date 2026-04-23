import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarMonth from "./CalendarMonth.vue";
import type { MonthGrid } from "@/composables/useDateRangePicker/types";
import { generateMonthGrid } from "@/composables/useDateRangePicker/calendar-utils";

function makeGrid(year: number, month: number): MonthGrid {
  return generateMonthGrid(year, month).map((week) =>
    week.map((date) => ({
      date,
      dayOfMonth: date.getDate(),
      isToday: false,
      isOutsideMonth: date.getMonth() + 1 !== month || date.getFullYear() !== year,
      isSelected: false,
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      isDisabled: false,
    })),
  );
}

describe("CalendarMonth", () => {
  const grid = makeGrid(2026, 4);

  it("renders month header", () => {
    const w = mount(CalendarMonth, {
      props: { year: 2026, month: 4, grid },
    });
    expect(w.text()).toContain("2026");
  });

  it("renders weekday row", () => {
    const w = mount(CalendarMonth, {
      props: { year: 2026, month: 4, grid },
    });
    const weekdays = w.findAll(".drp-weekday");
    expect(weekdays).toHaveLength(7);
  });

  it("renders 6 week rows with 7 days each", () => {
    const w = mount(CalendarMonth, {
      props: { year: 2026, month: 4, grid },
    });
    const weekRows = w.findAll(".drp-week-row");
    expect(weekRows).toHaveLength(6);

    const buttons = w.findAll(".drp-day");
    expect(buttons).toHaveLength(42);
  });

  it("emits select-day when a day is clicked", async () => {
    const w = mount(CalendarMonth, {
      props: { year: 2026, month: 4, grid },
    });
    const buttons = w.findAll(".drp-day");
    // Click the third button (should be a date)
    await buttons[2].trigger("click");
    expect(w.emitted("select-day")).toHaveLength(1);
    expect(w.emitted("select-day")![0][0]).toBeInstanceOf(Date);
  });
});
