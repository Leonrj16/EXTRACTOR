"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { GALLERY_BLOCK_INTERACTIVE, LIGHTBOX_IMAGE_VARIANTS, LIGHTBOX_OVERLAY_VARIANTS } from "./animation";
import { GALLERY_BLOCK_DEFAULT_META } from "./config";
import { ITEM_CLASS, LAYOUT_CLASS } from "./styles";
import type { GalleryBlockMeta } from "./types";

export function GalleryBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
}: BlockPreviewProps<GalleryBlockMeta>) {
  const resolved = { ...GALLERY_BLOCK_DEFAULT_META, ...meta };
  const images = resolved.images ?? [];
  const layout = resolved.layout ?? "grid";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  if (images.length === 0) return null;

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={GALLERY_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      <div className={`overflow-hidden p-1 ${theme.cardRadius}`} style={style}>
        {link.title && <p className="mb-2 px-1 text-sm font-medium">{link.title}</p>}
        <div className={LAYOUT_CLASS[layout]}>
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src + i}
              src={src}
              alt=""
              onClick={() => setOpenIndex(i)}
              className={`cursor-zoom-in rounded-lg ${ITEM_CLASS[layout]}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={LIGHTBOX_OVERLAY_VARIANTS}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-6"
            onClick={() => setOpenIndex(null)}
          >
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              onClick={() => setOpenIndex(null)}
            >
              <X className="size-5" />
            </button>
            <motion.img
              variants={LIGHTBOX_IMAGE_VARIANTS}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              src={images[openIndex]}
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </BlockFrame>
  );
}
