import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarWeekdayRow from "./CalendarWeekdayRow.vue";

describe("CalendarWeekdayRow", () => {
  it("renders 7 weekday labels", () => {
    const w = mount(CalendarWeekdayRow);
    const spans = w.findAll(".drp-weekday");
    expect(spans).toHaveLength(7);
  });

  it("starts with Monday in French", () => {
    const w = mount(CalendarWeekdayRow, { props: { locale: "fr-FR" } });
    const spans = w.findAll(".drp-weekday");
    expect(spans[0].text().toLowerCase()).toContain("lun");
  });

  it("renders in English when locale is en-US", () => {
    const w = mount(CalendarWeekdayRow, { props: { locale: "en-US" } });
    const spans = w.findAll(".drp-weekday");
    expect(spans[0].text().toLowerCase()).toContain("mon");
  });
});
