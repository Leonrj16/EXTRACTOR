import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { LinkItem, LinkType } from "@/types/link";

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
  animation?: "fade" | "slide" | "scale" | "none";
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
