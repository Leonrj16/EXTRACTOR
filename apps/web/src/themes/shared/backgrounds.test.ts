import { describe, expect, it } from "vitest";
import type { ThemeColors } from "../types";
import { PARTICLE_DOTS, resolveBackground } from "./backgrounds";

const COLORS: ThemeColors = {
  primary: "#7c3aed",
  secondary: "#0ea5e9",
  accent: "#f472b6",
  background: "#0b0b12",
  surface: "#151521",
  text: "#ffffff",
  textMuted: "#9ca3af",
};

describe("PARTICLE_DOTS", () => {
  it("is a fixed, deterministic list (no Math.random) so SSR/CSR never mismatch", () => {
    expect(PARTICLE_DOTS).toHaveLength(14);
    // Calling resolveBackground repeatedly must never change the values —
    // this is what makes hydration safe.
    const again = PARTICLE_DOTS.map((d) => ({ ...d }));
    expect(again).toEqual(PARTICLE_DOTS);
  });
});

describe("resolveBackground", () => {
  it("falls back to a default gradient when 'gradient' has no explicit value", () => {
    const result = resolveBackground({ type: "gradient" }, COLORS);
    expect(result.decoration).toBe("none");
    expect(result.style.backgroundImage).toContain(COLORS.background);
    expect(result.style.backgroundImage).toContain(COLORS.accent);
  });

  it("uses the explicit value when 'gradient' has one", () => {
    const result = resolveBackground({ type: "gradient", value: "linear-gradient(red, blue)" }, COLORS);
    expect(result.style.backgroundImage).toBe("linear-gradient(red, blue)");
  });

  it("flags 'aurora' with its DOM decoration so ProfileView renders the extra blobs", () => {
    const result = resolveBackground({ type: "aurora" }, COLORS);
    expect(result.decoration).toBe("aurora");
  });

  it("renders a real video when 'video' has a URL", () => {
    const result = resolveBackground({ type: "video", value: "https://cdn.test/bg.mp4" }, COLORS);
    expect(result.decoration).toBe("video");
    expect(result.videoUrl).toBe("https://cdn.test/bg.mp4");
    expect(result.overlayOpacity).toBe(0.45);
  });

  it("respects a custom overlayOpacity for 'video'", () => {
    const result = resolveBackground({ type: "video", value: "https://cdn.test/bg.mp4", overlayOpacity: 0.8 }, COLORS);
    expect(result.overlayOpacity).toBe(0.8);
  });

  it("falls back to a solid background when 'video' has no URL, instead of an empty player", () => {
    const result = resolveBackground({ type: "video" }, COLORS);
    expect(result.decoration).toBe("none");
    expect(result.videoUrl).toBeUndefined();
    expect(result.style.backgroundColor).toBe(COLORS.background);
  });

  it("flags 'particles' with its DOM decoration", () => {
    const result = resolveBackground({ type: "particles" }, COLORS);
    expect(result.decoration).toBe("particles");
  });

  it("uses the background image only when 'image' has a value, else the solid color", () => {
    const withImage = resolveBackground({ type: "image", value: "https://cdn.test/photo.png" }, COLORS);
    expect(withImage.style.backgroundImage).toBe("url(https://cdn.test/photo.png)");

    const withoutImage = resolveBackground({ type: "image" }, COLORS);
    expect(withoutImage.style.backgroundImage).toBeUndefined();
    expect(withoutImage.style.backgroundColor).toBe(COLORS.background);
  });

  it("applies a blur filter only when blurPx is given", () => {
    const blurred = resolveBackground({ type: "blur" }, COLORS, 12);
    expect(blurred.style.filter).toBe("blur(12px)");

    const unblurred = resolveBackground({ type: "blur" }, COLORS);
    expect(unblurred.style.filter).toBeUndefined();
  });

  it("defaults to a solid background for 'solid' and for any unrecognized type", () => {
    const solid = resolveBackground({ type: "solid" }, COLORS);
    expect(solid.decoration).toBe("none");
    expect(solid.style.backgroundColor).toBe(COLORS.background);

    // @ts-expect-error deliberately exercising the default branch
    const unknown = resolveBackground({ type: "not-a-real-type" }, COLORS);
    expect(unknown).toEqual(solid);
  });
});
