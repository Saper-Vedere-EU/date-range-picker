import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NavArrow from "./NavArrow.vue";

describe("NavArrow", () => {
  it("renders left arrow", () => {
    const w = mount(NavArrow, { props: { direction: "left" } });
    expect(w.text()).toBe("‹");
    expect(w.find("button").classes()).toContain("drp-nav-arrow--left");
  });

  it("renders right arrow", () => {
    const w = mount(NavArrow, { props: { direction: "right" } });
    expect(w.text()).toBe("›");
    expect(w.find("button").classes()).toContain("drp-nav-arrow--right");
  });

  it("emits click when clicked", async () => {
    const w = mount(NavArrow, { props: { direction: "left" } });
    await w.find("button").trigger("click");
    expect(w.emitted("click")).toHaveLength(1);
  });

  it("is disabled when disabled prop is true", () => {
    const w = mount(NavArrow, {
      props: { direction: "left", disabled: true },
    });
    expect(w.find("button").attributes("disabled")).toBeDefined();
  });

  it("has correct aria-label", () => {
    const left = mount(NavArrow, { props: { direction: "left" } });
    expect(left.find("button").attributes("aria-label")).toBe(
      "Mois précédent",
    );

    const right = mount(NavArrow, { props: { direction: "right" } });
    expect(right.find("button").attributes("aria-label")).toBe("Mois suivant");
  });
});
