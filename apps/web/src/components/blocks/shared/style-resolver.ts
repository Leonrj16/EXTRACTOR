import type { CSSProperties } from "react";
import type { BlockStyleOverrides, ResponsiveFieldOverrides } from "../types";

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

type ResponsiveField = "padding" | "margin" | "width";
type ResponsiveBucket = "mobile" | "tablet" | "desktop";

function fieldIsResponsive(
  field: ResponsiveField,
  responsive: BlockStyleOverrides["responsive"] | undefined,
): boolean {
  if (!responsive) return false;
  return !!(responsive.mobile?.[field] || responsive.tablet?.[field] || responsive.desktop?.[field]);
}

/**
 * Tailwind's build-time scanner only generates CSS for class names it can
 * see literally in source text — a class assembled via string
 * interpolation at runtime (`` `${prefix}[--x:${value}]` ``) is invisible
 * to it and silently produces no CSS. Since padding/margin/width each
 * have a small fixed set of possible values, every combination is spelled
 * out here as a literal string instead, and `resolveResponsiveFrameClasses`
 * below only ever looks one up — it never concatenates one.
 */
const PADDING_VAR_CLASS: Record<ResponsiveBucket, Record<NonNullable<BlockStyleOverrides["padding"]>, string>> = {
  mobile: {
    none: "[--block-padding:0]",
    sm: "[--block-padding:0.75rem]",
    md: "[--block-padding:1.25rem]",
    lg: "[--block-padding:2rem]",
  },
  tablet: {
    none: "sm:[--block-padding:0]",
    sm: "sm:[--block-padding:0.75rem]",
    md: "sm:[--block-padding:1.25rem]",
    lg: "sm:[--block-padding:2rem]",
  },
  desktop: {
    none: "lg:[--block-padding:0]",
    sm: "lg:[--block-padding:0.75rem]",
    md: "lg:[--block-padding:1.25rem]",
    lg: "lg:[--block-padding:2rem]",
  },
};

const MARGIN_VAR_CLASS: Record<ResponsiveBucket, Record<NonNullable<BlockStyleOverrides["margin"]>, string>> = {
  mobile: {
    none: "[--block-margin:0]",
    sm: "[--block-margin:0.5rem]",
    md: "[--block-margin:1rem]",
    lg: "[--block-margin:2rem]",
  },
  tablet: {
    none: "sm:[--block-margin:0]",
    sm: "sm:[--block-margin:0.5rem]",
    md: "sm:[--block-margin:1rem]",
    lg: "sm:[--block-margin:2rem]",
  },
  desktop: {
    none: "lg:[--block-margin:0]",
    sm: "lg:[--block-margin:0.5rem]",
    md: "lg:[--block-margin:1rem]",
    lg: "lg:[--block-margin:2rem]",
  },
};

const WIDTH_VAR_CLASS: Record<ResponsiveBucket, Record<NonNullable<BlockStyleOverrides["width"]>, string>> = {
  mobile: { auto: "[--block-width:auto]", full: "[--block-width:100%]" },
  tablet: { auto: "sm:[--block-width:auto]", full: "sm:[--block-width:100%]" },
  desktop: { auto: "lg:[--block-width:auto]", full: "lg:[--block-width:100%]" },
};

/**
 * Emits the Tailwind classes that set `--block-padding`/`--block-margin`/
 * `--block-width` at each breakpoint the block has a responsive override
 * for — meant for `BlockFrame`'s wrapper div, which is an ancestor of the
 * inner element `resolveBlockStyle` styles. CSS custom properties
 * inherit down the tree, so setting them here and reading them via
 * `var(--block-padding)` there needs no per-block id/selector or
 * generated `<style>` tag, and no specificity fight with inline styles.
 *
 * Each breakpoint is set independently (not left to cascade): a bucket
 * without its own override still gets an explicit class using the base
 * `padding`/`margin`/`width` value, so e.g. a "desktop" override can
 * never be shadowed by whatever "tablet" resolved to.
 */
export function resolveResponsiveFrameClasses(overrides: BlockStyleOverrides | null | undefined): string {
  const responsive = overrides?.responsive;
  if (!responsive) return "";

  const paddingResponsive = fieldIsResponsive("padding", responsive);
  const marginResponsive = fieldIsResponsive("margin", responsive);
  const widthResponsive = fieldIsResponsive("width", responsive);
  if (!paddingResponsive && !marginResponsive && !widthResponsive) return "";

  const classes: string[] = [];
  (["mobile", "tablet", "desktop"] as const).forEach((bucket) => {
    const bucketOverrides: ResponsiveFieldOverrides | undefined = responsive[bucket];
    if (paddingResponsive) {
      const padding = bucketOverrides?.padding ?? overrides?.padding;
      if (padding) classes.push(PADDING_VAR_CLASS[bucket][padding]);
    }
    if (marginResponsive) {
      const margin = bucketOverrides?.margin ?? overrides?.margin;
      if (margin) classes.push(MARGIN_VAR_CLASS[bucket][margin]);
    }
    if (widthResponsive) {
      const width = bucketOverrides?.width ?? overrides?.width ?? "auto";
      classes.push(WIDTH_VAR_CLASS[bucket][width]);
    }
  });
  return classes.join(" ");
}

/**
 * The JS-computed equivalent of `resolveResponsiveFrameClasses`, for a
 * single known device — used only by the Visual Editor's simulated
 * device frames (see `BlockTheme.previewDevice`), which can't rely on
 * real `sm:`/`lg:` media queries since their "screen size" is a CSS
 * `max-width` on a box inside the admin's actual (usually much wider)
 * browser window. Returns inline CSS custom properties that override the
 * media-query classes (inline style always wins), so the editor's canvas
 * shows exactly the bucket the user is previewing regardless of the real
 * viewport width.
 */
export function resolveResponsiveFrameVars(
  overrides: BlockStyleOverrides | null | undefined,
  device: ResponsiveBucket,
): CSSProperties {
  const responsive = overrides?.responsive;
  if (!responsive) return {};
  const bucket = responsive[device];
  const vars: Record<string, string> = {};

  if (fieldIsResponsive("padding", responsive)) {
    const padding = bucket?.padding ?? overrides?.padding;
    if (padding) vars["--block-padding"] = PADDING_MAP[padding];
  }
  if (fieldIsResponsive("margin", responsive)) {
    const margin = bucket?.margin ?? overrides?.margin;
    if (margin) vars["--block-margin"] = MARGIN_MAP[margin];
  }
  if (fieldIsResponsive("width", responsive)) {
    const width = bucket?.width ?? overrides?.width ?? "auto";
    vars["--block-width"] = width === "full" ? "100%" : "auto";
  }

  return vars as CSSProperties;
}

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

  // A responsive override for a field hands it off entirely to the CSS
  // variable BlockFrame sets on the ancestor wrapper (see
  // resolveResponsiveFrameClasses) instead of a literal value here — the
  // variable already resolves per-breakpoint, a literal here would just
  // pointlessly match the "mobile" bucket at every screen size.
  if (fieldIsResponsive("padding", o.responsive)) style.padding = "var(--block-padding)";
  else if (o.padding) style.padding = PADDING_MAP[o.padding];

  if (fieldIsResponsive("margin", o.responsive)) style.margin = "var(--block-margin)";
  else if (o.margin) style.margin = MARGIN_MAP[o.margin];

  if (o.background) style.backgroundColor = o.background;
  if (o.radius) style.borderRadius = RADIUS_MAP[o.radius];

  if (fieldIsResponsive("width", o.responsive)) style.width = "var(--block-width)";
  else if (o.width === "full") style.width = "100%";
  if (typeof o.opacity === "number") style.opacity = Math.max(0, Math.min(100, o.opacity)) / 100;
  if (o.align) style.alignSelf = ALIGN_SELF[o.align];

  if (o.border) Object.assign(style, resolveBorderStyle(o.border, ctx.primaryColor));

  const shadow = resolveShadowStyle(o.shadow, ctx.primaryColor);
  if (shadow) style.boxShadow = shadow;

  return style;
}

/**
 * `styleOverrides.hiddenOn` → a Tailwind visibility className, so hiding a
 * block "on mobile" is a real CSS media query on the public page (not a JS
 * check that would flash-then-hide). Breakpoint mapping: mobile = base
 * (<640px), tablet = sm..lg (640-1024px), desktop = lg+ (1024px+) — the
 * same 3 buckets the editor's device switcher uses.
 */
const RESPONSIVE_VISIBILITY_CLASS: Record<string, string> = {
  "": "",
  mobile: "hidden sm:block",
  tablet: "sm:hidden lg:block",
  desktop: "lg:hidden",
  "mobile,tablet": "hidden lg:block",
  "mobile,desktop": "hidden sm:block lg:hidden",
  "tablet,desktop": "sm:hidden",
  "mobile,tablet,desktop": "hidden",
};

export function resolveResponsiveVisibility(
  hiddenOn: BlockStyleOverrides["hiddenOn"] | undefined,
): string {
  if (!hiddenOn || hiddenOn.length === 0) return "";
  const key = [...hiddenOn].sort().join(",");
  return RESPONSIVE_VISIBILITY_CLASS[key] ?? "";
}
