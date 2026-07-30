import { Images } from "lucide-react";
import type { GalleryBlockMeta } from "./types";

export const GALLERY_BLOCK_DEFAULT_META: GalleryBlockMeta = { images: [], layout: "grid" };
export const GALLERY_BLOCK_ICON = Images;
export const GALLERY_BLOCK_LABEL = "Galería";
export const GALLERY_BLOCK_DESCRIPTION =
  "Varias imágenes en grid, carrusel o masonry, con lightbox al hacer clic.";
