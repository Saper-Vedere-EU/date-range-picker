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

  it("emits click-month-header when month button is clicked", async () => {
    const w = mount(CalendarMonth, {
      props: { year: 2026, month: 4, grid },
    });
    await w.find(".drp-month-header__btn--month").trigger("click");
    expect(w.emitted("click-month-header")).toHaveLength(1);
  });

  it("emits click-year-header when year button is clicked", async () => {
    const w = mount(CalendarMonth, {
      props: { year: 2026, month: 4, grid },
    });
    await w.find(".drp-month-header__btn--year").trigger("click");
    expect(w.emitted("click-year-header")).toHaveLength(1);
  });

  describe("month picker", () => {
    it("shows month grid when monthPickerOpen is true", () => {
      const w = mount(CalendarMonth, {
        props: { year: 2026, month: 4, grid, monthPickerOpen: true },
      });
      expect(w.find(".drp-month-grid").exists()).toBe(true);
      expect(w.findAll(".drp-month-cell")).toHaveLength(12);
    });

    it("hides day grid when monthPickerOpen is true", () => {
      const w = mount(CalendarMonth, {
        props: { year: 2026, month: 4, grid, monthPickerOpen: true },
      });
      expect(w.findAll(".drp-week-row")).toHaveLength(0);
      expect(w.findAll(".drp-weekday")).toHaveLength(0);
    });

    it("shows day grid when monthPickerOpen is false", () => {
      const w = mount(CalendarMonth, {
        props: { year: 2026, month: 4, grid, monthPickerOpen: false },
      });
      expect(w.find(".drp-month-grid").exists()).toBe(false);
      expect(w.findAll(".drp-week-row")).toHaveLength(6);
    });

    it("marks the current month in the grid", () => {
      const w = mount(CalendarMonth, {
        props: { year: 2026, month: 4, grid, monthPickerOpen: true },
      });
      const currentCells = w.findAll(".drp-month-cell--current");
      expect(currentCells).toHaveLength(1);
    });

    it("emits select-month when a month cell is clicked", async () => {
      const w = mount(CalendarMonth, {
        props: { year: 2026, month: 4, grid, monthPickerOpen: true },
      });
      const cells = w.findAll(".drp-month-cell");
      await cells[6].trigger("click"); // July (index 6 = month 7)
      expect(w.emitted("select-month")).toHaveLength(1);
      expect(w.emitted("select-month")![0]).toEqual([7]);
    });
  });

  describe("year picker", () => {
    it("shows year grid when yearPickerOpen is true", () => {
      const w = mount(CalendarMonth, {
        props: {
          year: 2026,
          month: 4,
          grid,
          yearPickerOpen: true,
          yearPickerBaseYear: 2016,
        },
      });
      expect(w.find(".drp-year-grid").exists()).toBe(true);
      expect(w.findAll(".drp-year-cell")).toHaveLength(12);
    });

    it("hides day grid when yearPickerOpen is true", () => {
      const w = mount(CalendarMonth, {
        props: {
          year: 2026,
          month: 4,
          grid,
          yearPickerOpen: true,
          yearPickerBaseYear: 2016,
        },
      });
      expect(w.findAll(".drp-week-row")).toHaveLength(0);
      expect(w.findAll(".drp-weekday")).toHaveLength(0);
    });

    it("renders 12 consecutive years starting from yearPickerBaseYear", () => {
      const w = mount(CalendarMonth, {
        props: {
          year: 2026,
          month: 4,
          grid,
          yearPickerOpen: true,
          yearPickerBaseYear: 2016,
        },
      });
      const cells = w.findAll(".drp-year-cell");
      expect(cells[0].text()).toBe("2016");
      expect(cells[11].text()).toBe("2027");
    });

    it("marks the current year in the grid", () => {
      const w = mount(CalendarMonth, {
        props: {
          year: 2026,
          month: 4,
          grid,
          yearPickerOpen: true,
          yearPickerBaseYear: 2016,
        },
      });
      const currentCells = w.findAll(".drp-year-cell--current");
      expect(currentCells).toHaveLength(1);
      expect(currentCells[0].text()).toBe("2026");
    });

    it("emits select-year when a year cell is clicked", async () => {
      const w = mount(CalendarMonth, {
        props: {
          year: 2026,
          month: 4,
          grid,
          yearPickerOpen: true,
          yearPickerBaseYear: 2016,
        },
      });
      const cells = w.findAll(".drp-year-cell");
      await cells[3].trigger("click"); // 2019
      expect(w.emitted("select-year")).toHaveLength(1);
      expect(w.emitted("select-year")![0]).toEqual([2019]);
    });

    it("hides month picker when year picker is open (year picker wins)", () => {
      const w = mount(CalendarMonth, {
        props: {
          year: 2026,
          month: 4,
          grid,
          monthPickerOpen: true,
          yearPickerOpen: true,
          yearPickerBaseYear: 2016,
        },
      });
      expect(w.find(".drp-year-grid").exists()).toBe(true);
      expect(w.find(".drp-month-grid").exists()).toBe(false);
    });
  });
});
