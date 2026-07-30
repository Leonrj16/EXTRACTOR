"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { resolveEntranceVariant, resolveHoverEffect } from "./animation-presets";
import { resolveResponsiveVisibility } from "./style-resolver";
import type { BlockStyleOverrides } from "../types";

/**
 * Every block's `preview.tsx` wraps its rendered content in this instead of
 * hand-rolling a `motion.div` — one place owns "how a block enters the
 * page and reacts to hover/tap", driven by that block's own
 * `styleOverrides.animation` instead of a page-wide setting.
 */
export function BlockFrame({
  styleOverrides,
  interactive,
  index,
  className,
  style,
  wide,
  glowColor = "#7c3aed",
  children,
}: {
  styleOverrides: BlockStyleOverrides;
  interactive?: boolean;
  index: number;
  className?: string;
  style?: CSSProperties;
  wide?: boolean;
  /** Color the "glow" hover effect uses — defaults to brand purple since
   * not every block's preview.tsx threads theme.primaryColor through yet
   * (see design-system/architecture/visual-editor.md). */
  glowColor?: string;
  children: ReactNode;
}) {
  const variants = resolveEntranceVariant(styleOverrides.animation);
  const hover = interactive ? { whileHover: undefined, whileTap: undefined } : resolveHoverEffect(styleOverrides.hoverEffect, glowColor);
  const visibilityClass = resolveResponsiveVisibility(styleOverrides.hiddenOn);

  const mergedClassName = [
    wide ? "col-span-2" : "",
    className ?? "",
    visibilityClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      initial="hidden"
      {...(styleOverrides.animateOnScroll
        ? { whileInView: "visible", viewport: { once: true, margin: "-80px" } }
        : { animate: "visible" })}
      variants={variants}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={hover.whileHover}
      whileTap={hover.whileTap}
      className={mergedClassName || undefined}
      style={style}
    >
      {children}
    </motion.div>
  );
}
