import { Type } from "lucide-react";
import type { TextBlockMeta } from "./types";

export const TEXT_BLOCK_DEFAULT_META: TextBlockMeta = { size: "md" };
export const TEXT_BLOCK_ICON = Type;
export const TEXT_BLOCK_LABEL = "Texto";
export const TEXT_BLOCK_DESCRIPTION =
  "Un párrafo de texto libre — para explicar algo que no cabe en el título de otro bloque.";

export const TEXT_SIZE_OPTIONS = [
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Medio" },
  { value: "lg", label: "Grande" },
];
