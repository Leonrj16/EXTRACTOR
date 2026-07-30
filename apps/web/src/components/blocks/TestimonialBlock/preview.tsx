"use client";

import { Star } from "lucide-react";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { TESTIMONIAL_BLOCK_INTERACTIVE } from "./animation";
import { TESTIMONIAL_BLOCK_DEFAULT_META } from "./config";
import { TESTIMONIAL_AVATAR_CLASS, TESTIMONIAL_CARD_CLASS } from "./styles";
import type { TestimonialBlockMeta } from "./types";

export function TestimonialBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
}: BlockPreviewProps<TestimonialBlockMeta>) {
  const resolved = { ...TESTIMONIAL_BLOCK_DEFAULT_META, ...meta };
  const rating = Math.max(0, Math.min(5, resolved.rating ?? 5));

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={TESTIMONIAL_BLOCK_INTERACTIVE} index={index}>
      <div className={`${TESTIMONIAL_CARD_CLASS} ${theme.cardRadius}`} style={style}>
        {rating > 0 && (
          <div className="flex gap-0.5" style={{ color: theme.primaryColor }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5" fill={i < rating ? "currentColor" : "none"} />
            ))}
          </div>
        )}
        <p className="text-sm leading-relaxed opacity-90">&ldquo;{link.title}&rdquo;</p>
        <div className="flex items-center gap-2.5">
          {link.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.imageUrl} alt="" className={TESTIMONIAL_AVATAR_CLASS} />
          ) : (
            <div
              className={`${TESTIMONIAL_AVATAR_CLASS} flex items-center justify-center text-xs font-semibold`}
              style={{ backgroundColor: `${theme.primaryColor}22` }}
            >
              {resolved.authorName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            {resolved.authorName && <p className="truncate text-sm font-medium">{resolved.authorName}</p>}
            {resolved.authorRole && (
              <p className="truncate text-xs opacity-70">{resolved.authorRole}</p>
            )}
          </div>
        </div>
      </div>
    </BlockFrame>
  );
}
