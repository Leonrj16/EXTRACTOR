import type { BlockStyleOverrides } from "@/components/blocks/types";

/**
 * The Theme Engine's contract. Every theme in /themes/<key>/ assembles
 * one of these; the registry (registry.ts) is the only place that maps
 * a `key` to a definition, and resolve-theme.ts is the only place that
 * merges a definition with a profile's Appearance overrides. See
 * design-system/architecture/theme-engine.md.
 */

export type ThemeCategory =
  | "minimalist"
  | "dark"
  | "professional"
  | "creative"
  | "business"
  | "fashion"
  | "health"
  | "restaurant"
  | "technology";

export const THEME_CATEGORY_LABELS: Record<ThemeCategory, string> = {
  minimalist: "Minimalistas",
  dark: "Oscuros",
  professional: "Profesionales",
  creative: "Creativos",
  business: "Negocios",
  fashion: "Moda",
  health: "Salud",
  restaurant: "Restaurantes",
  technology: "Tecnología",
};

// The 7 fonts actually available (next/font/google) — Satoshi isn't on
// Google Fonts, so it's left out rather than silently faked; see
// design-system/architecture/theme-engine.md.
export type FontKey =
  | "inter"
  | "space-grotesk"
  | "manrope"
  | "poppins"
  | "outfit"
  | "dm-sans"
  | "plus-jakarta-sans";

export type FontWeight = 400 | 500 | 600 | 700;
export type LetterSpacing = "tight" | "normal" | "wide";
export type LineHeight = "tight" | "normal" | "relaxed";
export type TextTransform = "none" | "uppercase" | "capitalize";

export interface ThemeTypography {
  font: FontKey;
  headingWeight: FontWeight;
  bodyWeight: FontWeight;
  letterSpacing: LetterSpacing;
  lineHeight: LineHeight;
  textTransform: TextTransform;
}

// The 10 button treatments from the spec. "rounded" is filled + full
// radius — kept as its own named treatment since the button *shape*
// axis (ButtonShape below) is a separate, pre-existing concept
// (Appearance.buttonStyle) that themes also set a default for.
export type ButtonTreatment =
  | "filled"
  | "outline"
  | "glass"
  | "minimal"
  | "gradient"
  | "3d"
  | "glow"
  | "floating"
  | "soft"
  | "rounded";

export type ButtonShape = "rounded" | "pill" | "square";

export interface ThemeButtons {
  treatment: ButtonTreatment;
  shape: ButtonShape;
}

export interface ThemeCards {
  radius: NonNullable<BlockStyleOverrides["radius"]>;
  shadow: NonNullable<BlockStyleOverrides["shadow"]>;
  border: NonNullable<BlockStyleOverrides["border"]>;
}

// Superset of blocks/shared/animation-presets.ts ENTRANCE_VARIANTS — the
// theme engine adds zoom/glow/float/parallax/ripple/pulse there so both
// blocks and themes share one Framer Motion source (see that file).
export type AnimationPreset =
  | "fade"
  | "slide"
  | "scale"
  | "zoom"
  | "glow"
  | "float"
  | "parallax"
  | "ripple"
  | "pulse"
  | "none";

export interface ThemeAnimations {
  entrance: AnimationPreset;
  hover: "lift" | "scale" | "glow" | "none";
}

// "video" and "particles" are real, named variants a theme can declare —
// BackgroundLayer (shared/backgrounds.ts) renders every type except
// those two for real today (falls back to `solid`); seeing them here is
// intentional so the contract doesn't need to change when they ship.
export type BackgroundType =
  | "solid"
  | "gradient"
  | "glass"
  | "aurora"
  | "mesh"
  | "image"
  | "pattern"
  | "blur"
  | "video"
  | "particles";

export interface BackgroundSpec {
  type: BackgroundType;
  /** Meaning depends on `type`: a CSS gradient string, an image/video URL, a pattern id... */
  value?: string;
  overlayOpacity?: number;
}

export interface ThemeEffects {
  background: BackgroundSpec;
  glow?: boolean;
  blurPx?: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface ThemeMetadata {
  name: string;
  tagline: string;
  categories: ThemeCategory[];
}

export interface ThemeDefinition {
  key: string;
  layout: "list" | "grid";
  colors: ThemeColors;
  typography: ThemeTypography;
  buttons: ThemeButtons;
  cards: ThemeCards;
  animations: ThemeAnimations;
  effects: ThemeEffects;
  meta: ThemeMetadata;
}

/** Deep customization a profile layers on top of a ThemeDefinition — the
 * shape of Appearance.themeOverrides. Every field optional: only what
 * the user actually touched in the editor gets stored. */
export interface ThemeOverrides {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  buttons?: Partial<ThemeButtons>;
  cards?: Partial<ThemeCards>;
  animations?: Partial<ThemeAnimations>;
  effects?: Partial<ThemeEffects>;
}
