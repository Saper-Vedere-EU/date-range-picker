import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarMonthHeader from "./CalendarMonthHeader.vue";

describe("CalendarMonthHeader", () => {
  it("renders month name and year in French", () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4 },
    });
    expect(w.text().toLowerCase()).toContain("avril");
    expect(w.text()).toContain("2026");
  });

  it("renders in English when locale is en-US", () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 4, locale: "en-US" },
    });
    expect(w.text().toLowerCase()).toContain("april");
    expect(w.text()).toContain("2026");
  });

  it("capitalizes the first letter", () => {
    const w = mount(CalendarMonthHeader, {
      props: { year: 2026, month: 1 },
    });
    const text = w.text();
    expect(text[0]).toBe(text[0].toUpperCase());
  });
});
