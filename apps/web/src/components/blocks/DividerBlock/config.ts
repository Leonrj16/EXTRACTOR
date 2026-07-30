import { Minus } from "lucide-react";
import type { DividerBlockMeta } from "./types";

export const DIVIDER_BLOCK_DEFAULT_META: DividerBlockMeta = { style: "line" };
export const DIVIDER_BLOCK_ICON = Minus;
export const DIVIDER_BLOCK_LABEL = "Separador";
export const DIVIDER_BLOCK_DESCRIPTION =
  "Una línea, puntos o simple espacio para separar secciones de la página.";

export const DIVIDER_STYLE_OPTIONS = [
  { value: "line", label: "Línea" },
  { value: "dashed", label: "Punteada" },
  { value: "dots", label: "Puntos" },
  { value: "space", label: "Solo espacio" },
];
