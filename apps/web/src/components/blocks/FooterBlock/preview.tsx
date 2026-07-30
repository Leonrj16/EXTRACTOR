"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { FOOTER_BLOCK_DEFAULT_META } from "./config";
import { FOOTER_BLOCK_INTERACTIVE } from "./animation";
import { FOOTER_LINK_ROW_CLASS, FOOTER_WRAPPER_CLASS } from "./styles";
import type { FooterBlockMeta } from "./types";

export function FooterBlockPreview({ link, meta, styleOverrides, theme, index }: BlockPreviewProps<FooterBlockMeta>) {
  const resolved = { ...FOOTER_BLOCK_DEFAULT_META, ...meta };
  const links = (resolved.links ?? []).filter((l) => l.label.trim());

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={FOOTER_BLOCK_INTERACTIVE} index={index}>
      <div className={`${FOOTER_WRAPPER_CLASS} ${theme.cardRadius}`} style={style}>
        {link.title && <p>{link.title}</p>}
        {links.length > 0 && (
          <div className={FOOTER_LINK_ROW_CLASS}>
            {links.map((l, i) => (
              <a key={i} href={l.url || "#"} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </BlockFrame>
  );
}
