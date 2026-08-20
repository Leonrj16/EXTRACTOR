"use client";

import { isDirectVideoUrl, toVideoEmbedUrl } from "@/lib/embed";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { VIDEO_BLOCK_INTERACTIVE } from "./animation";
import { VIDEO_BLOCK_DEFAULT_META } from "./config";
import { VIDEO_FALLBACK_CLASS, VIDEO_WRAPPER_CLASS } from "./styles";
import type { VideoBlockMeta } from "./types";

export function VideoBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
}: BlockPreviewProps<VideoBlockMeta>) {
  const resolved = { ...VIDEO_BLOCK_DEFAULT_META, ...meta };
  const url = link.url ?? "";
  const isMp4 = resolved.source === "mp4" || isDirectVideoUrl(url);
  const embedUrl = !isMp4 && url ? toVideoEmbedUrl(url, { autoplay: resolved.autoplay }) : null;

  const fallbackStyle = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });
  const mediaStyle = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: {},
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={VIDEO_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      <div className={`${VIDEO_WRAPPER_CLASS} ${theme.cardRadius}`}>
        <p className="mb-1 text-sm font-medium">{link.title}</p>

        {isMp4 && url ? (
          <video
            src={url}
            poster={link.imageUrl ?? undefined}
            autoPlay={resolved.autoplay}
            muted={resolved.autoplay}
            loop={resolved.autoplay}
            playsInline
            controls
            className={`aspect-video w-full ${theme.cardRadius}`}
            style={mediaStyle}
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className={`aspect-video w-full ${theme.cardRadius}`}
            style={mediaStyle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className={`${VIDEO_FALLBACK_CLASS} ${theme.cardRadius}`} style={fallbackStyle}>
            URL de video no válida
          </div>
        )}
      </div>
    </BlockFrame>
  );
}
