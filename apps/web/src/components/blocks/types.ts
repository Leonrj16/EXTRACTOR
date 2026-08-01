import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { LinkItem, LinkType } from "@/types/link";
import type { ButtonTreatment } from "@/themes/types";

/**
 * A block IS a `Link` row under the hood (see design-system/architecture/
 * blocks.md for why the table wasn't renamed). `BlockKind` is just a
 * semantic alias so block code never has to import from `types/link` to
 * talk about "what kind of block this is".
 */
export type BlockKind = LinkType;

/**
 * The shared style panel every block gets for free — one settings UI
 * (`shared/style-panel.tsx`), one resolver (`shared/style-resolver.ts`),
 * consumed by every block's `preview.tsx` instead of each block inventing
 * its own padding/border/shadow handling.
 */
/** One device bucket of `BlockStyleOverrides.responsive` — deliberately
 * only the 3 fields whose values are plain layout box-model sizes (not
 * colors/borders/animations), the ones that actually differ in a useful
 * way by viewport. */
export interface ResponsiveFieldOverrides {
  padding?: BlockStyleOverrides["padding"];
  margin?: BlockStyleOverrides["margin"];
  width?: BlockStyleOverrides["width"];
}

export interface BlockStyleOverrides {
  padding?: "none" | "sm" | "md" | "lg";
  margin?: "none" | "sm" | "md" | "lg";
  background?: string;
  border?: "none" | "subtle" | "solid" | "thick";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  shadow?: "none" | "soft" | "glow";
  align?: "left" | "center" | "right";
  width?: "auto" | "full";
  opacity?: number; // 0-100
  animation?: "fade" | "slide" | "scale" | "rotate" | "bounce" | "none";
  /**
   * Visual Editor additions (see design-system/architecture/visual-editor.md).
   * These are editor/rendering concerns, not new database columns — they
   * live inside the same styleOverrides JSON blob a block already had.
   */
  /** Purely an editor-UX flag: the Layers panel and canvas refuse to drag,
   * duplicate, or delete a locked block until it's unlocked. No effect on
   * the public page render. */
  locked?: boolean;
  /** Hides the block on specific breakpoints of the public page — the
   * "responsive visibility" slice of per-device properties. See
   * `responsive` below for the per-field (padding/margin/width) slice. */
  hiddenOn?: Array<"desktop" | "tablet" | "mobile">;
  /**
   * Per-breakpoint overrides for padding/margin/width. Each device is
   * independent, not cascading: a device with no override for a field
   * falls back to that field's own base value above (`padding`/`margin`/
   * `width`), never to what a smaller breakpoint resolved to — so
   * configuring only "Escritorio" never surprises you with the tablet
   * value leaking in at 900px. See `resolveResponsiveFrameClasses` in
   * shared/style-resolver.ts for how this becomes real CSS.
   */
  responsive?: Partial<Record<"mobile" | "tablet" | "desktop", ResponsiveFieldOverrides>>;
  /** Hover micro-interaction, independent of the entrance animation. */
  hoverEffect?: "lift" | "scale" | "glow" | "none";
  /** Plays the entrance animation when the block scrolls into view
   * (Framer Motion `whileInView`) instead of once on mount. */
  animateOnScroll?: boolean;
}

/** Resolved page-level theme every block's preview renders against. */
export interface BlockTheme {
  primaryColor: string;
  /** Button-shaped radius class (can be `rounded-full`) — see foundations/05-radius.md */
  radius: string;
  /** Card-shaped radius class (capped, never a lens/circle on tall blocks) */
  cardRadius: string;
  /** Page-level border (from Appearance.borderStyle) — the default a block
   * falls back to when its own styleOverrides.border isn't set. */
  pageBorder: import("react").CSSProperties;
  /** Page-level shadow (from Appearance.shadowStyle), same fallback role. */
  pageShadow: string | undefined;
  /** Theme Engine additions (see themes/resolve-theme.ts) — optional so
   * every block written before the Theme Engine keeps compiling
   * unchanged; adopting them is opt-in per block. */
  secondaryColor?: string;
  accentColor?: string;
  buttonTreatment?: ButtonTreatment;
  /**
   * Only set by the design editor's simulated device frames (same rule as
   * `ProfileView`'s own `previewDevice` prop, which this threads through
   * from). Those frames fake a screen size with a CSS `max-width` on a
   * fixed box, so the real `sm:`/`lg:` media queries
   * `resolveResponsiveFrameClasses` emits would evaluate against the
   * *actual* browser viewport, not the simulated one — wrong in the
   * editor. `BlockFrame` uses this to set the same CSS variables inline
   * (which always win over the media-query classes) computed for exactly
   * this device instead. The real public page never sets this and relies
   * purely on the CSS classes, which is correct there.
   */
  previewDevice?: "desktop" | "tablet" | "mobile";
}

export interface BlockPreviewProps<TMeta = Record<string, unknown>> {
  link: LinkItem;
  meta: TMeta;
  styleOverrides: BlockStyleOverrides;
  theme: BlockTheme;
  /** Position in the visible block list — drives the entrance stagger delay. */
  index: number;
  onLinkClick?: (link: LinkItem) => void;
  onContactSubmit?: (
    link: LinkItem,
    values: { name: string; email: string; message: string },
  ) => Promise<void>;
}

export interface BlockSettingsProps<TMeta = Record<string, unknown>> {
  link: LinkItem;
  meta: TMeta;
  /** Patch the common top-level Link fields a block cares about. */
  onPatch: (patch: Partial<Pick<LinkItem, "title" | "url" | "icon" | "imageUrl">>) => void;
  /** Replace this block's own metadata blob (merged, not overwritten, by the caller). */
  onMetaChange: (meta: Partial<TMeta>) => void;
}

export interface BlockDefinition<TMeta = Record<string, unknown>> {
  kind: BlockKind;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultMeta: TMeta;
  /**
   * Interactive blocks (video, music, form) skip the generic hover/tap
   * scale (a playing video shouldn't "press" like a button) and are
   * allowed to span both columns in grid layout.
   */
  interactive?: boolean;
  Preview: ComponentType<BlockPreviewProps<TMeta>>;
  Settings: ComponentType<BlockSettingsProps<TMeta>>;
}
