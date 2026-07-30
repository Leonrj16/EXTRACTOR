import type { ButtonBlockMeta } from "./types";

export const BUTTON_SIZE_CLASS: Record<NonNullable<ButtonBlockMeta["size"]>, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3.5 text-sm",
  lg: "px-6 py-4 text-base",
};
