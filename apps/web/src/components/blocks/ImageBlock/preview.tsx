"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { IMAGE_BLOCK_DEFAULT_META } from "./config";
import { IMAGE_BLOCK_INTERACTIVE } from "./animation";
import { IMAGE_CAPTION_CLASS, IMAGE_FRAME_CLASS, IMAGE_WRAPPER_CLASS } from "./styles";
import type { ImageBlockMeta } from "./types";

export function ImageBlockPreview({ link, meta, styleOverrides, theme, index, onLinkClick }: BlockPreviewProps<ImageBlockMeta>) {
  const resolved = { ...IMAGE_BLOCK_DEFAULT_META, ...meta };

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const image = link.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={link.imageUrl}
      alt={link.title || "Imagen"}
      className={`h-full w-full ${resolved.fit === "contain" ? "object-contain" : "object-cover"}`}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-black/10 text-xs opacity-50">Sin imagen</div>
  );

  const content = (
    <div className={`${IMAGE_WRAPPER_CLASS} ${theme.cardRadius}`} style={style}>
      <div className={`${IMAGE_FRAME_CLASS} ${theme.cardRadius}`}>
        {link.url ? (
          <a href={link.url} target="_blank" rel="noreferrer" onClick={() => onLinkClick?.(link)} className="block h-full w-full">
            {image}
          </a>
        ) : (
          image
        )}
      </div>
      {link.title && <p className={IMAGE_CAPTION_CLASS}>{link.title}</p>}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={IMAGE_BLOCK_INTERACTIVE} index={index}>
      {content}
    </BlockFrame>
  );
}
