import type { CSSProperties } from "react";
import type { Variants } from "framer-motion";
import { resolveEntranceVariant } from "@/components/blocks/shared/animation-presets";
import { resolveBorderStyle, resolveShadowStyle } from "@/components/blocks/shared/style-resolver";
import { getThemeDefinition } from "./registry";
import { minimalWhiteTheme } from "./minimal-white";
import { resolveBackground, type ResolvedBackground } from "./shared/backgrounds";
import { FONT_CSS_VAR, FONT_NAME_TO_KEY, LETTER_SPACING_CSS, LINE_HEIGHT_CSS } from "./shared/fonts";
import type { ButtonShape, ButtonTreatment, ThemeDefinition, ThemeOverrides } from "./types";

const BUTTON_SHAPE_RADIUS_CLASS: Record<ButtonShape, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
  square: "rounded-none",
};

// ThemeCards.radius uses the same "none"|"sm"|"md"|"lg"|"full" scale as
// BlockStyleOverrides.radius (see blocks/types.ts) — one vocabulary for
// "how round is this container" everywhere, cards included. A theme's
// card radius is independent of its button shape (previously the two
// were coupled, which meant every theme with pill buttons was forced
// into the same card curve too).
const CARD_RADIUS_CLASS: Record<ThemeDefinition["cards"]["radius"], string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export interface ResolvedTheme {
  layout: "list" | "grid";
  primaryColor: string;
  backgroundColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamilyCss: string;
  headingWeight: number;
  bodyWeight: number;
  typographyStyle: CSSProperties;
  buttonTreatment: ButtonTreatment;
  buttonRadiusClass: string;
  cardRadiusClass: string;
  pageBorder: CSSProperties;
  pageShadow: string | undefined;
  entranceVariant: Variants;
  hover: "lift" | "scale" | "glow" | "none";
  background: ResolvedBackground;
  glow: boolean;
}

/** Only the Appearance fields resolve-theme actually reads — kept narrow
 * so callers don't have to construct a full AppearanceData just to test this. */
export interface AppearanceQuickOverrides {
  primaryColor?: string | null;
  backgroundColor?: string | null;
  buttonStyle?: string | null;
  borderStyle?: string | null;
  shadowStyle?: string | null;
  fontFamily?: string | null;
  animation?: string | null;
  layout?: string | null;
}

/**
 * A custom theme (isSystem: false) has no entry in THEME_REGISTRY — its
 * Theme.baseConfig IS the full definition, written by the frontend at
 * "Guardar tema"/"Duplicar" time. This fills in anything missing from a
 * fallback theme so a malformed/partial import can't crash rendering.
 */
export function normalizeCustomThemeDefinition(
  key: string,
  layout: string | undefined,
  baseConfig: unknown,
): ThemeDefinition {
  const fallback = minimalWhiteTheme;
  const bc = (baseConfig ?? {}) as Partial<ThemeDefinition>;
  return {
    key,
    layout: layout === "grid" ? "grid" : layout === "list" ? "list" : fallback.layout,
    meta: bc.meta ?? { name: key, tagline: "", categories: [] },
    colors: { ...fallback.colors, ...bc.colors },
    typography: { ...fallback.typography, ...bc.typography },
    buttons: { ...fallback.buttons, ...bc.buttons },
    cards: { ...fallback.cards, ...bc.cards },
    animations: { ...fallback.animations, ...bc.animations },
    effects: { ...fallback.effects, ...bc.effects },
  };
}

/** Looks a theme up in the code registry first (system themes); falls
 * back to normalizing the DB row's baseConfig (custom themes). */
export function getResolvedDefinition(
  themeKey: string | undefined,
  layout: string | undefined,
  baseConfig: unknown,
): ThemeDefinition {
  if (themeKey) {
    const fromRegistry = getThemeDefinition(themeKey);
    if (fromRegistry) return fromRegistry;
  }
  return normalizeCustomThemeDefinition(themeKey ?? "custom", layout, baseConfig);
}

function resolveFontFamilyCss(
  overrideFont: string | undefined,
  legacyFontFamily: string | null | undefined,
  definitionFont: string,
): string {
  if (overrideFont && overrideFont in FONT_CSS_VAR) {
    return FONT_CSS_VAR[overrideFont as keyof typeof FONT_CSS_VAR];
  }
  if (legacyFontFamily) {
    const mappedKey = FONT_NAME_TO_KEY[legacyFontFamily];
    // An unrecognized legacy value (e.g. an old "Roboto"/"Playfair
    // Display" pick from before this font catalog existed) is used as a
    // literal font-family string — exactly how it always behaved.
    return mappedKey ? FONT_CSS_VAR[mappedKey] : legacyFontFamily;
  }
  return FONT_CSS_VAR[definitionFont as keyof typeof FONT_CSS_VAR] ?? definitionFont;
}

/**
 * The Theme Engine's merge step: system/custom ThemeDefinition (base) →
 * Appearance's existing scalar quick-overrides (unchanged fields,
 * unchanged precedence) → Appearance.themeOverrides (new deep
 * customization). Produces one flat, render-ready object — ProfileView
 * (and in time, blocks) consume this instead of re-deriving tokens
 * themselves. See design-system/architecture/theme-engine.md.
 */
export function resolveTheme(
  definition: ThemeDefinition,
  appearance: AppearanceQuickOverrides,
  overrides: ThemeOverrides | null | undefined,
): ResolvedTheme {
  const o = overrides ?? {};

  const primaryColor = appearance.primaryColor ?? definition.colors.primary;
  const backgroundColor = appearance.backgroundColor ?? definition.colors.background;
  const secondaryColor = o.colors?.secondary ?? definition.colors.secondary;
  const accentColor = o.colors?.accent ?? definition.colors.accent;

  const buttonShape = (appearance.buttonStyle as ButtonShape | undefined) ?? definition.buttons.shape;
  const buttonTreatment = o.buttons?.treatment ?? definition.buttons.treatment;

  const cardRadius = o.cards?.radius ?? definition.cards.radius;
  const cardBorderKey = (appearance.borderStyle as ThemeDefinition["cards"]["border"] | undefined) ?? definition.cards.border;
  const cardShadowKey = (appearance.shadowStyle as ThemeDefinition["cards"]["shadow"] | undefined) ?? definition.cards.shadow;

  const headingWeight = o.typography?.headingWeight ?? definition.typography.headingWeight;
  const bodyWeight = o.typography?.bodyWeight ?? definition.typography.bodyWeight;
  const letterSpacing = o.typography?.letterSpacing ?? definition.typography.letterSpacing;
  const lineHeight = o.typography?.lineHeight ?? definition.typography.lineHeight;
  const textTransform = o.typography?.textTransform ?? definition.typography.textTransform;

  const entranceKey = appearance.animation ?? definition.animations.entrance;
  const hover = o.animations?.hover ?? definition.animations.hover;

  const backgroundSpec = o.effects?.background ?? definition.effects.background;
  const glow = o.effects?.glow ?? definition.effects.glow ?? false;
  const blurPx = o.effects?.blurPx ?? definition.effects.blurPx;

  // Backgrounds (gradient/mesh/aurora) are colored from the *resolved*
  // palette, not the theme's raw defaults — a color override should
  // flow through to them too, not just to solid fills.
  const resolvedColors = {
    ...definition.colors,
    primary: primaryColor,
    background: backgroundColor,
    secondary: secondaryColor,
    accent: accentColor,
  };

  return {
    layout: (appearance.layout as "list" | "grid" | undefined) ?? definition.layout,
    primaryColor,
    backgroundColor,
    secondaryColor,
    accentColor,
    fontFamilyCss: resolveFontFamilyCss(o.typography?.font, appearance.fontFamily, definition.typography.font),
    headingWeight,
    bodyWeight,
    typographyStyle: {
      letterSpacing: LETTER_SPACING_CSS[letterSpacing],
      lineHeight: LINE_HEIGHT_CSS[lineHeight],
      textTransform,
    },
    buttonTreatment,
    buttonRadiusClass: BUTTON_SHAPE_RADIUS_CLASS[buttonShape] ?? "rounded-xl",
    cardRadiusClass: CARD_RADIUS_CLASS[cardRadius] ?? "rounded-xl",
    pageBorder: resolveBorderStyle(cardBorderKey, primaryColor),
    pageShadow: resolveShadowStyle(cardShadowKey, primaryColor),
    entranceVariant: resolveEntranceVariant(entranceKey),
    hover,
    background: resolveBackground(backgroundSpec, resolvedColors, blurPx),
    glow,
  };
}
