import { describe, expect, it } from "vitest";
import type { BlockStyleOverrides } from "../types";
import {
  resolveBlockStyle,
  resolveBorderStyle,
  resolveResponsiveFrameClasses,
  resolveResponsiveFrameVars,
  resolveResponsiveVisibility,
  resolveShadowStyle,
} from "./style-resolver";

const CTX = { primaryColor: "#7c3aed", pageBorder: {}, pageShadow: undefined };

describe("resolveBorderStyle", () => {
  it("returns nothing for an unset key", () => {
    expect(resolveBorderStyle(undefined, "#000")).toEqual({});
  });

  it("maps 'none' to a zero-width border, not an absent one (page defaults still apply otherwise)", () => {
    expect(resolveBorderStyle("none", "#000000")).toEqual({
      borderWidth: "0px",
      borderStyle: "solid",
      borderColor: "#00000000",
    });
  });

  it("increases width and full opacity for 'thick'", () => {
    expect(resolveBorderStyle("thick", "#ff0000")).toEqual({
      borderWidth: "2.5px",
      borderStyle: "solid",
      borderColor: "#ff0000ff",
    });
  });
});

describe("resolveShadowStyle", () => {
  it("returns undefined when unset", () => {
    expect(resolveShadowStyle(undefined, "#000")).toBeUndefined();
  });

  it("returns 'none' literally for the 'none' key (distinct from unset)", () => {
    expect(resolveShadowStyle("none", "#000")).toBe("none");
  });

  it("builds a colored glow using the primary color", () => {
    expect(resolveShadowStyle("glow", "#7c3aed")).toBe("0 0 24px #7c3aed66");
  });
});

describe("resolveResponsiveVisibility", () => {
  it("returns an empty string when nothing is hidden", () => {
    expect(resolveResponsiveVisibility(undefined)).toBe("");
    expect(resolveResponsiveVisibility([])).toBe("");
  });

  it("hides only on mobile, shown from sm up", () => {
    expect(resolveResponsiveVisibility(["mobile"])).toBe("hidden sm:block");
  });

  it("hides on all three devices", () => {
    expect(resolveResponsiveVisibility(["mobile", "tablet", "desktop"])).toBe("hidden");
  });

  it("is order-independent (sorts before lookup)", () => {
    expect(resolveResponsiveVisibility(["desktop", "mobile"])).toBe(
      resolveResponsiveVisibility(["mobile", "desktop"]),
    );
  });

  // Regression coverage: the lookup table is keyed by the exact string
  // `[...hiddenOn].sort().join(",")` produces, which is plain lexicographic
  // order ("desktop" < "mobile" < "tablet") — not the mobile/tablet/desktop
  // reading order it's tempting to write the table in. Getting that wrong
  // doesn't throw, it silently returns "" (block stays visible everywhere
  // instead of being hidden), so every non-alphabetically-already-sorted
  // combination gets its own explicit assertion here.
  it("hides on mobile+desktop (a combination not already in alphabetical order)", () => {
    expect(resolveResponsiveVisibility(["mobile", "desktop"])).not.toBe("");
    expect(resolveResponsiveVisibility(["mobile", "desktop"])).toBe("hidden sm:block lg:hidden");
  });

  it("hides on tablet+desktop (a combination not already in alphabetical order)", () => {
    expect(resolveResponsiveVisibility(["tablet", "desktop"])).not.toBe("");
    expect(resolveResponsiveVisibility(["tablet", "desktop"])).toBe("sm:hidden");
  });
});

describe("resolveBlockStyle", () => {
  it("applies padding/margin/radius/background/width/opacity/align from a plain override", () => {
    const style = resolveBlockStyle(
      { padding: "lg", margin: "sm", radius: "full", background: "#fff", width: "full", opacity: 50, align: "center" },
      CTX,
    );
    expect(style).toMatchObject({
      padding: "2rem",
      margin: "0.5rem",
      borderRadius: "9999px",
      backgroundColor: "#fff",
      width: "100%",
      opacity: 0.5,
      alignSelf: "center",
    });
  });

  it("clamps opacity to the 0-100 range before converting to a 0-1 fraction", () => {
    expect(resolveBlockStyle({ opacity: 150 }, CTX).opacity).toBe(1);
    expect(resolveBlockStyle({ opacity: -20 }, CTX).opacity).toBe(0);
  });

  it("falls back to the page border/shadow when the block sets none of its own", () => {
    const style = resolveBlockStyle(null, {
      primaryColor: "#000",
      pageBorder: { borderWidth: "1px" },
      pageShadow: "0 0 10px black",
    });
    expect(style.borderWidth).toBe("1px");
    expect(style.boxShadow).toBe("0 0 10px black");
  });

  it("lets a block's own border/shadow override the page defaults", () => {
    const style = resolveBlockStyle(
      { border: "thick", shadow: "glow" },
      { primaryColor: "#7c3aed", pageBorder: { borderWidth: "1px" }, pageShadow: "0 0 10px black" },
    );
    expect(style.borderWidth).toBe("2.5px");
    expect(style.boxShadow).toBe("0 0 24px #7c3aed66");
  });

  it("references the shared CSS variable instead of a literal value for a field with a responsive override", () => {
    const overrides: BlockStyleOverrides = {
      padding: "sm",
      responsive: { desktop: { padding: "lg" } },
    };
    const style = resolveBlockStyle(overrides, CTX);
    expect(style.padding).toBe("var(--block-padding)");
  });

  it("keeps a literal value for fields that have no responsive override at all", () => {
    const overrides: BlockStyleOverrides = {
      padding: "sm",
      margin: "md",
      responsive: { desktop: { padding: "lg" } },
    };
    const style = resolveBlockStyle(overrides, CTX);
    expect(style.padding).toBe("var(--block-padding)");
    expect(style.margin).toBe("1rem"); // margin has no responsive override, stays literal
  });
});

describe("resolveResponsiveFrameClasses", () => {
  it("returns an empty string when there's no responsive config", () => {
    expect(resolveResponsiveFrameClasses(null)).toBe("");
    expect(resolveResponsiveFrameClasses({ padding: "sm" })).toBe("");
  });

  it("emits a class for every breakpoint once any bucket overrides that field, falling back to the base value for buckets that don't", () => {
    const classes = resolveResponsiveFrameClasses({
      padding: "sm",
      responsive: { desktop: { padding: "lg" } },
    });
    // mobile/tablet have no override of their own -> fall back to base "sm"
    expect(classes).toContain("[--block-padding:0.75rem]");
    expect(classes).toContain("sm:[--block-padding:0.75rem]");
    // desktop has its own override
    expect(classes).toContain("lg:[--block-padding:2rem]");
  });

  it("only emits classes for fields that actually have a responsive override", () => {
    const classes = resolveResponsiveFrameClasses({
      padding: "sm",
      margin: "md",
      responsive: { desktop: { padding: "lg" } },
    });
    expect(classes).not.toContain("margin");
  });

  it("defaults width to 'auto' for a bucket with neither its own value nor a base value", () => {
    const classes = resolveResponsiveFrameClasses({
      responsive: { mobile: { width: "full" } },
    });
    expect(classes).toContain("[--block-width:100%]");
    expect(classes).toContain("sm:[--block-width:auto]");
    expect(classes).toContain("lg:[--block-width:auto]");
  });
});

describe("resolveResponsiveFrameVars", () => {
  it("returns an empty object when there's no responsive config", () => {
    expect(resolveResponsiveFrameVars(null, "desktop")).toEqual({});
  });

  it("computes the literal value for exactly the requested device, ignoring the others", () => {
    const vars = resolveResponsiveFrameVars(
      { padding: "sm", responsive: { mobile: { padding: "none" }, desktop: { padding: "lg" } } },
      "mobile",
    );
    expect(vars).toEqual({ "--block-padding": "0" });
  });

  it("falls back to the base value for a device with no override of its own", () => {
    const vars = resolveResponsiveFrameVars(
      { padding: "sm", responsive: { desktop: { padding: "lg" } } },
      "tablet",
    );
    expect(vars).toEqual({ "--block-padding": "0.75rem" });
  });
});
