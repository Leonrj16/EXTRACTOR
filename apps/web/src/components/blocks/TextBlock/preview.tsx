"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { TEXT_BLOCK_DEFAULT_META } from "./config";
import { TEXT_BLOCK_INTERACTIVE } from "./animation";
import { TEXT_CARD_CLASS, TEXT_SIZE_CLASS } from "./styles";
import type { TextBlockMeta } from "./types";

export function TextBlockPreview({ link, meta, styleOverrides, theme, index }: BlockPreviewProps<TextBlockMeta>) {
  const resolved = { ...TEXT_BLOCK_DEFAULT_META, ...meta };

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const content = (
    <div className={`${TEXT_CARD_CLASS} ${theme.cardRadius}`} style={style}>
      {link.title && <span className="text-sm font-medium">{link.title}</span>}
      {resolved.body && (
        <p className={`${TEXT_SIZE_CLASS[resolved.size ?? "md"]} whitespace-pre-line opacity-80`}>{resolved.body}</p>
      )}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={TEXT_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      {content}
    </BlockFrame>
  );
}
