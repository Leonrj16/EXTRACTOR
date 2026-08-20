import { HelpCircle } from "lucide-react";
import type { FaqBlockMeta } from "./types";

export const FAQ_BLOCK_DEFAULT_META: FaqBlockMeta = {
  items: [{ question: "", answer: "" }],
};
export const FAQ_BLOCK_ICON = HelpCircle;
export const FAQ_BLOCK_LABEL = "Preguntas frecuentes";
export const FAQ_BLOCK_DESCRIPTION = "Un acordeón de preguntas y respuestas.";
