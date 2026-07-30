"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { BUTTON_BLOCK_DEFAULT_META } from "./config";
import { BUTTON_BLOCK_INTERACTIVE } from "./animation";
import { BUTTON_SIZE_CLASS } from "./styles";
import type { ButtonBlockMeta } from "./types";

export function ButtonBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<ButtonBlockMeta>) {
  const resolved = { ...BUTTON_BLOCK_DEFAULT_META, ...meta };
  const color = resolved.color ?? theme.primaryColor;

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: color,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={BUTTON_BLOCK_INTERACTIVE} index={index}>
      <a
        href={link.url ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`block w-full text-center font-medium outline-none backdrop-blur-md transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${theme.radius} ${BUTTON_SIZE_CLASS[resolved.size ?? "md"]}`}
        style={{ ...style, backgroundColor: style.backgroundColor ?? `${color}14` }}
      >
        {link.title}
      </a>
    </BlockFrame>
  );
}
