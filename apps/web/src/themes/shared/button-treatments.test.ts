import { describe, expect, it } from "vitest";
import type { ButtonTreatment } from "../types";
import { BUTTON_TREATMENT_OPTIONS, resolveButtonTreatment } from "./button-treatments";

const ALL_TREATMENTS: ButtonTreatment[] = [
  "filled",
  "outline",
  "glass",
  "minimal",
  "gradient",
  "3d",
  "glow",
  "floating",
  "soft",
  "rounded",
];

describe("resolveButtonTreatment", () => {
  it.each(ALL_TREATMENTS)("returns a className and style for every declared treatment ('%s')", (treatment) => {
    const result = resolveButtonTreatment(treatment, "#7c3aed", "#0ea5e9");
    expect(typeof result.className).toBe("string");
    expect(typeof result.style).toBe("object");
  });

  it("uses the primary color as the gradient's fallback when no secondary color is given", () => {
    const result = resolveButtonTreatment("gradient", "#7c3aed", undefined);
    expect(result.style.backgroundImage).toBe("linear-gradient(135deg, #7c3aed, #7c3aed)");
  });

  it("uses a distinct secondary color for the gradient when one is provided", () => {
    const result = resolveButtonTreatment("gradient", "#7c3aed", "#0ea5e9");
    expect(result.style.backgroundImage).toBe("linear-gradient(135deg, #7c3aed, #0ea5e9)");
  });

  it("makes 'outline' transparent with just a colored border", () => {
    const result = resolveButtonTreatment("outline", "#7c3aed");
    expect(result.style.backgroundColor).toBe("transparent");
    expect(result.style.border).toContain("#7c3aed");
  });

  it("gives 'rounded' a pill className distinct from other treatments", () => {
    expect(resolveButtonTreatment("rounded", "#7c3aed").className).toBe("rounded-full");
  });

  it("falls back to the 'filled' treatment for an unrecognized value", () => {
    // @ts-expect-error deliberately passing an invalid value to exercise the default branch
    const result = resolveButtonTreatment("not-a-real-treatment", "#7c3aed");
    expect(result).toEqual(resolveButtonTreatment("filled", "#7c3aed"));
  });

  it("lists every ButtonTreatment value exactly once in BUTTON_TREATMENT_OPTIONS", () => {
    const optionValues = BUTTON_TREATMENT_OPTIONS.map((o) => o.value).sort();
    expect(optionValues).toEqual([...ALL_TREATMENTS].sort());
  });
});
