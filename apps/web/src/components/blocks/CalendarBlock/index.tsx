import type { BlockDefinition } from "../types";
import { CALENDAR_BLOCK_DEFAULT_META, CALENDAR_BLOCK_DESCRIPTION, CALENDAR_BLOCK_ICON, CALENDAR_BLOCK_LABEL } from "./config";
import { CalendarBlockPreview } from "./preview";
import { CalendarBlockSettings } from "./settings";
import type { CalendarBlockMeta } from "./types";

export const calendarBlockDefinition: BlockDefinition<CalendarBlockMeta> = {
  kind: "CALENDAR",
  label: CALENDAR_BLOCK_LABEL,
  description: CALENDAR_BLOCK_DESCRIPTION,
  icon: CALENDAR_BLOCK_ICON,
  defaultMeta: CALENDAR_BLOCK_DEFAULT_META,
  Preview: CalendarBlockPreview,
  Settings: CalendarBlockSettings,
};
