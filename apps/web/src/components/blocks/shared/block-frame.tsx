"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { resolveEntranceVariant, BLOCK_HOVER_TAP } from "./animation-presets";
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
  children,
}: {
  styleOverrides: BlockStyleOverrides;
  interactive?: boolean;
  index: number;
  className?: string;
  style?: CSSProperties;
  wide?: boolean;
  children: ReactNode;
}) {
  const variants = resolveEntranceVariant(styleOverrides.animation);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={interactive ? undefined : BLOCK_HOVER_TAP.whileHover}
      whileTap={interactive ? undefined : BLOCK_HOVER_TAP.whileTap}
      className={wide ? `col-span-2 ${className ?? ""}` : className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
