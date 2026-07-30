import { minimalWhiteTheme } from "./minimal-white";
import { midnightDarkTheme } from "./midnight-dark";
import { auroraTheme } from "./aurora";
import { glassPremiumTheme } from "./glass-premium";
import { purpleNeonTheme } from "./purple-neon";
import { oceanBlueTheme } from "./ocean-blue";
import { forestTheme } from "./forest";
import { sunsetTheme } from "./sunset";
import { luxuryBlackTheme } from "./luxury-black";
import { elegantGoldTheme } from "./elegant-gold";
import { modernStartupTheme } from "./modern-startup";
import { creatorTheme } from "./creator";
import { photographerTheme } from "./photographer";
import { doctorTheme } from "./doctor";
import { restaurantTheme } from "./restaurant";
import { agencyTheme } from "./agency";
import { portfolioTheme } from "./portfolio";
import { fashionTheme } from "./fashion";
import { corporateTheme } from "./corporate";
import { techTheme } from "./tech";
import type { ThemeCategory, ThemeDefinition } from "./types";

/**
 * The one place a new system theme gets wired in. To add a theme:
 *   1. Create /themes/<key>/{theme.json, index.ts} following the pattern
 *      of any existing theme (see design-system/architecture/theme-engine.md).
 *   2. Import it here and add one line to this record.
 *
 * Custom themes a user creates (Guardar tema/Duplicar) have NO entry
 * here — they exist only as Theme rows in the database, keyed the same
 * way but resolved entirely from Theme.baseConfig. getThemeDefinition
 * returning undefined for a key is exactly that case, not an error.
 */
export const THEME_REGISTRY: Record<string, ThemeDefinition> = {
  "minimal-white": minimalWhiteTheme,
  "midnight-dark": midnightDarkTheme,
  aurora: auroraTheme,
  "glass-premium": glassPremiumTheme,
  "purple-neon": purpleNeonTheme,
  "ocean-blue": oceanBlueTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  "luxury-black": luxuryBlackTheme,
  "elegant-gold": elegantGoldTheme,
  "modern-startup": modernStartupTheme,
  creator: creatorTheme,
  photographer: photographerTheme,
  doctor: doctorTheme,
  restaurant: restaurantTheme,
  agency: agencyTheme,
  portfolio: portfolioTheme,
  fashion: fashionTheme,
  corporate: corporateTheme,
  tech: techTheme,
};

export function getThemeDefinition(key: string): ThemeDefinition | undefined {
  return THEME_REGISTRY[key];
}

export function listThemeDefinitions(): ThemeDefinition[] {
  return Object.values(THEME_REGISTRY);
}

export function searchThemeDefinitions(
  themes: ThemeDefinition[],
  query: string,
  categories: ThemeCategory[],
): ThemeDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();
  return themes.filter((theme) => {
    const matchesQuery =
      !normalizedQuery ||
      theme.meta.name.toLowerCase().includes(normalizedQuery) ||
      theme.meta.tagline.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      categories.length === 0 || theme.meta.categories.some((c) => categories.includes(c));
    return matchesQuery && matchesCategory;
  });
}
