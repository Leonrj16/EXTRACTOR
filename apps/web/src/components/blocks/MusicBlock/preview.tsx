"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { toMusicEmbedUrl } from "@/lib/embed";
import type { BlockPreviewProps } from "../types";
import { MUSIC_BLOCK_INTERACTIVE } from "./animation";
import { MUSIC_FALLBACK_CLASS, MUSIC_IFRAME_CLASS } from "./styles";
import type { MusicBlockMeta } from "./types";

export function MusicBlockPreview({ link, styleOverrides, theme, index }: BlockPreviewProps<MusicBlockMeta>) {
  const embedUrl = link.url ? toMusicEmbedUrl(link.url) : null;

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={MUSIC_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className={MUSIC_IFRAME_CLASS}
          style={{ boxShadow: style.boxShadow }}
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      ) : (
        <div className={`${MUSIC_FALLBACK_CLASS} ${theme.cardRadius}`} style={style}>
          URL de Spotify no válida
        </div>
      )}
    </BlockFrame>
  );
}
