import type { CSSProperties } from "react";
import type { BackgroundSpec, ThemeColors } from "../types";

export interface ResolvedBackground {
  style: CSSProperties;
  /** Which extra DOM decoration ProfileView needs to render alongside `style` —
   * everything else (solid/gradient/glass/mesh/image/blur) is fully expressible
   * as a CSS background and needs no extra markup. */
  decoration: "none" | "aurora" | "pattern" | "video" | "particles";
  /** Only set when decoration is "video" — the <video> element's src. */
  videoUrl?: string;
  /** Dark scrim over a video background so text stays legible regardless
   * of what's playing underneath — 0 disables it entirely. */
  overlayOpacity?: number;
}

// A subtle repeating dot grid — data-uri so it needs no asset/upload.
const DOT_PATTERN = (color: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E")`;

/** Deterministic (no Math.random — a client component re-rendering with a
 * different value than what the server sent would be a hydration
 * mismatch) spread of floating dots for the "particles" background. */
export const PARTICLE_DOTS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 2 + (i % 3),
  duration: 9 + (i % 5) * 2,
  delay: (i % 7) * 0.7,
}));

/**
 * Turns a theme's BackgroundSpec into a CSS style + an optional DOM
 * decoration flag. `video` needs a URL (`spec.value`) to actually render a
 * `<video>` — without one it falls back to `solid` rather than showing a
 * broken/empty player.
 */
export function resolveBackground(
  spec: BackgroundSpec,
  colors: ThemeColors,
  blurPx?: number,
): ResolvedBackground {
  switch (spec.type) {
    case "gradient":
      return {
        style: { backgroundImage: spec.value ?? `linear-gradient(160deg, ${colors.background}, ${colors.accent})` },
        decoration: "none",
      };
    case "mesh":
      return {
        style: {
          backgroundColor: colors.background,
          backgroundImage: [
            `radial-gradient(at 15% 20%, ${colors.primary}33 0px, transparent 50%)`,
            `radial-gradient(at 85% 10%, ${colors.accent}33 0px, transparent 50%)`,
            `radial-gradient(at 50% 90%, ${colors.secondary}2e 0px, transparent 50%)`,
          ].join(", "),
        },
        decoration: "none",
      };
    case "aurora":
      return { style: { backgroundColor: colors.background }, decoration: "aurora" };
    case "glass":
      return {
        style: {
          backgroundColor: colors.background,
          backgroundImage: `linear-gradient(180deg, ${colors.surface}, transparent)`,
        },
        decoration: "none",
      };
    case "pattern":
      return {
        style: { backgroundColor: colors.background, backgroundImage: DOT_PATTERN(colors.textMuted) },
        decoration: "pattern",
      };
    case "blur":
      return {
        style: {
          backgroundColor: colors.background,
          backgroundImage: `radial-gradient(circle at 50% 0%, ${colors.primary}55, transparent 60%)`,
          filter: blurPx ? `blur(${blurPx}px)` : undefined,
        },
        decoration: "none",
      };
    case "image":
      return {
        style: spec.value
          ? { backgroundImage: `url(${spec.value})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: colors.background },
        decoration: "none",
      };
    case "video":
      return spec.value
        ? {
            style: { backgroundColor: colors.background },
            decoration: "video",
            videoUrl: spec.value,
            overlayOpacity: spec.overlayOpacity ?? 0.45,
          }
        : { style: { backgroundColor: colors.background }, decoration: "none" };
    case "particles":
      return { style: { backgroundColor: colors.background }, decoration: "particles" };
    case "solid":
    default:
      return { style: { backgroundColor: colors.background }, decoration: "none" };
  }
}

export const BACKGROUND_TYPE_OPTIONS: Array<{ value: BackgroundSpec["type"]; label: string }> = [
  { value: "solid", label: "Color sólido" },
  { value: "gradient", label: "Gradiente" },
  { value: "glass", label: "Glass" },
  { value: "aurora", label: "Aurora" },
  { value: "mesh", label: "Mesh Gradient" },
  { value: "pattern", label: "Patrón" },
  { value: "blur", label: "Blur" },
  { value: "image", label: "Imagen" },
  { value: "video", label: "Video" },
  { value: "particles", label: "Partículas" },
];
