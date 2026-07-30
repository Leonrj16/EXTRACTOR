import type { FontKey } from "../types";

// CSS variable each font is exposed under — declared once in
// app/layout.tsx (next/font/google) and consumed here so a theme's
// `typography.font` resolves to a real, loaded web font instead of a
// bare name the browser has to guess at (see layout.tsx for why this
// matters — it was a latent bug before the Theme Engine).
export const FONT_CSS_VAR: Record<FontKey, string> = {
  inter: "var(--font-inter)",
  "space-grotesk": "var(--font-space-grotesk)",
  manrope: "var(--font-manrope)",
  poppins: "var(--font-poppins)",
  outfit: "var(--font-outfit)",
  "dm-sans": "var(--font-dm-sans)",
  "plus-jakarta-sans": "var(--font-plus-jakarta-sans)",
};

export const FONT_LABELS: Record<FontKey, string> = {
  inter: "Inter",
  "space-grotesk": "Space Grotesk",
  manrope: "Manrope",
  poppins: "Poppins",
  outfit: "Outfit",
  "dm-sans": "DM Sans",
  "plus-jakarta-sans": "Plus Jakarta Sans",
};

export const FONT_OPTIONS = (Object.keys(FONT_LABELS) as FontKey[]).map((value) => ({
  value,
  label: FONT_LABELS[value],
}));

// Appearance.fontFamily predates the Theme Engine and stores the human
// label ("Space Grotesk") rather than a FontKey slug — this reverse map
// lets resolve-theme.ts turn that legacy value into a real CSS var. A
// label that isn't in this map (an old "Roboto"/"Playfair Display" pick
// from before this font catalog existed) is used as a literal
// font-family string instead, exactly like it always was.
export const FONT_NAME_TO_KEY: Record<string, FontKey> = Object.fromEntries(
  (Object.keys(FONT_LABELS) as FontKey[]).map((key) => [FONT_LABELS[key], key]),
);

export const LETTER_SPACING_CSS: Record<string, string> = {
  tight: "-0.01em",
  normal: "0em",
  wide: "0.05em",
};

export const LINE_HEIGHT_CSS: Record<string, string> = {
  tight: "1.2",
  normal: "1.5",
  relaxed: "1.75",
};
