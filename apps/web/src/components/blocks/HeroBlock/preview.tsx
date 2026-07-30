"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { HERO_BLOCK_DEFAULT_META } from "./config";
import { HERO_BLOCK_INTERACTIVE } from "./animation";
import { HERO_AVATAR_CLASS, HERO_BUTTON_CLASS, HERO_COVER_CLASS, HERO_WRAPPER_CLASS } from "./styles";
import type { HeroBlockMeta } from "./types";

export function HeroBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<HeroBlockMeta>) {
  const resolved = { ...HERO_BLOCK_DEFAULT_META, ...meta };
  const buttons = (resolved.buttons ?? []).filter((b) => b.label.trim());

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={HERO_BLOCK_INTERACTIVE} index={index}>
      <div className={`${HERO_WRAPPER_CLASS} ${theme.cardRadius}`} style={style}>
        {link.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.imageUrl} alt="" className={HERO_COVER_CLASS} />
        )}
        {resolved.avatarUrl && (
          <div className={HERO_AVATAR_CLASS} style={{ borderColor: theme.primaryColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolved.avatarUrl} alt={link.title} className="h-full w-full object-cover" />
          </div>
        )}
        <h2 className="text-lg font-semibold">{link.title}</h2>
        {resolved.description && <p className="max-w-xs text-sm opacity-80">{resolved.description}</p>}
        {buttons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {buttons.map((button, i) => (
              <a
                key={i}
                href={button.url || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={() => onLinkClick?.(link)}
                className={`${HERO_BUTTON_CLASS} ${theme.radius}`}
                style={{ backgroundColor: `${theme.primaryColor}14` }}
              >
                {button.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </BlockFrame>
  );
}
