import type { CSSProperties } from "react";
import type { BlockStyleOverrides } from "../types";

const PADDING_MAP: Record<NonNullable<BlockStyleOverrides["padding"]>, string> = {
  none: "0",
  sm: "0.75rem",
  md: "1.25rem",
  lg: "2rem",
};

const MARGIN_MAP: Record<NonNullable<BlockStyleOverrides["margin"]>, string> = {
  none: "0",
  sm: "0.5rem",
  md: "1rem",
  lg: "2rem",
};

const RADIUS_MAP: Record<NonNullable<BlockStyleOverrides["radius"]>, string> = {
  none: "0",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  full: "9999px",
};

const BORDER_WIDTH: Record<NonNullable<BlockStyleOverrides["border"]>, number> = {
  none: 0,
  subtle: 1,
  solid: 1.5,
  thick: 2.5,
};

const BORDER_ALPHA: Record<NonNullable<BlockStyleOverrides["border"]>, string> = {
  none: "00",
  subtle: "33",
  solid: "ff",
  thick: "ff",
};

const ALIGN_SELF: Record<NonNullable<BlockStyleOverrides["align"]>, CSSProperties["alignSelf"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export interface StyleResolverContext {
  primaryColor: string;
  /** Page-level border style (from Appearance.borderStyle), used as the
   * default when a block doesn't set its own — a block override always
   * wins, it never has to re-specify the page default to keep it. */
  pageBorder: CSSProperties;
  pageShadow: string | undefined;
}

/**
 * Border CSS for a single `"none"|"subtle"|"solid"|"thick"` key. Shared by
 * the page-level Appearance border (profile-view.tsx) and per-block
 * overrides (resolveBlockStyle) so the two never drift apart.
 */
export function resolveBorderStyle(
  key: BlockStyleOverrides["border"] | undefined,
  primaryColor: string,
): CSSProperties {
  if (!key) return {};
  return {
    borderWidth: `${BORDER_WIDTH[key]}px`,
    borderStyle: "solid",
    borderColor: `${primaryColor}${BORDER_ALPHA[key]}`,
  };
}

/**
 * Box-shadow CSS for a single `"none"|"soft"|"glow"` key. Shared by the
 * page-level Appearance shadow (profile-view.tsx) and per-block overrides
 * (resolveBlockStyle).
 */
export function resolveShadowStyle(
  key: BlockStyleOverrides["shadow"] | undefined,
  primaryColor: string,
): string | undefined {
  if (key === "glow") return `0 0 24px ${primaryColor}66`;
  if (key === "soft") return "0 8px 24px rgba(0,0,0,0.25)";
  if (key === "none") return "none";
  return undefined;
}

/**
 * Turns a block's `styleOverrides` into inline styles, layered on top of
 * the page's own border/shadow defaults. Every new block's `preview.tsx`
 * calls this once instead of hand-rolling padding/border/shadow math —
 * see design-system/architecture/blocks.md.
 */
export function resolveBlockStyle(
  overrides: BlockStyleOverrides | null | undefined,
  ctx: StyleResolverContext,
): CSSProperties {
  const o = overrides ?? {};
  const style: CSSProperties = { ...ctx.pageBorder };
  if (ctx.pageShadow) style.boxShadow = ctx.pageShadow;

  if (o.padding) style.padding = PADDING_MAP[o.padding];
  if (o.margin) style.margin = MARGIN_MAP[o.margin];
  if (o.background) style.backgroundColor = o.background;
  if (o.radius) style.borderRadius = RADIUS_MAP[o.radius];
  if (o.width === "full") style.width = "100%";
  if (typeof o.opacity === "number") style.opacity = Math.max(0, Math.min(100, o.opacity)) / 100;
  if (o.align) style.alignSelf = ALIGN_SELF[o.align];

  if (o.border) Object.assign(style, resolveBorderStyle(o.border, ctx.primaryColor));

  const shadow = resolveShadowStyle(o.shadow, ctx.primaryColor);
  if (shadow) style.boxShadow = shadow;

  return style;
}
