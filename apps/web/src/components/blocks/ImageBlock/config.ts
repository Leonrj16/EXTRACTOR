import { Image as ImageIcon } from "lucide-react";
import type { ImageBlockMeta } from "./types";

export const IMAGE_BLOCK_DEFAULT_META: ImageBlockMeta = { fit: "cover" };
export const IMAGE_BLOCK_ICON = ImageIcon;
export const IMAGE_BLOCK_LABEL = "Imagen";
export const IMAGE_BLOCK_DESCRIPTION =
  "Una imagen individual con leyenda y enlace de salida opcionales.";

export const IMAGE_FIT_OPTIONS = [
  { value: "cover", label: "Recortar (cover)" },
  { value: "contain", label: "Completa (contain)" },
];
