import type { BlockDefinition } from "../types";
import { HERO_BLOCK_DEFAULT_META, HERO_BLOCK_DESCRIPTION, HERO_BLOCK_ICON, HERO_BLOCK_LABEL } from "./config";
import { HeroBlockPreview } from "./preview";
import { HeroBlockSettings } from "./settings";
import type { HeroBlockMeta } from "./types";

export const heroBlockDefinition: BlockDefinition<HeroBlockMeta> = {
  kind: "HERO",
  label: HERO_BLOCK_LABEL,
  description: HERO_BLOCK_DESCRIPTION,
  icon: HERO_BLOCK_ICON,
  defaultMeta: HERO_BLOCK_DEFAULT_META,
  interactive: true,
  Preview: HeroBlockPreview,
  Settings: HeroBlockSettings,
};
