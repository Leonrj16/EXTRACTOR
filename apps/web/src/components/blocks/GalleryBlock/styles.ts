import type { GalleryBlockMeta } from "./types";

export const LAYOUT_CLASS: Record<NonNullable<GalleryBlockMeta["layout"]>, string> = {
  grid: "grid grid-cols-3 gap-2",
  carousel: "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1",
  masonry: "columns-2 gap-2 [&>*]:mb-2",
};

export const ITEM_CLASS: Record<NonNullable<GalleryBlockMeta["layout"]>, string> = {
  grid: "aspect-square w-full object-cover",
  carousel: "h-32 w-32 shrink-0 snap-start object-cover",
  masonry: "w-full object-cover",
};
