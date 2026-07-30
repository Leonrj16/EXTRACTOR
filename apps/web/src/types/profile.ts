export interface ProfileData {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  whatsapp: string | null;
  contactEmail: string | null;
  location: string | null;
  locationUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
}

export interface ThemeData {
  id: string;
  key: string;
  name: string;
  layout: string;
  isSystem: boolean;
  previewUrl: string | null;
  // For system themes this only carries light gallery metadata
  // (categories/tagline) — the render-ready definition lives in
  // apps/web/src/themes/<key>/. For custom themes it's the source of
  // truth (see themes/resolve-theme.ts getResolvedDefinition). Kept
  // as an opaque bag here on purpose — only resolve-theme.ts should
  // read into it.
  baseConfig: Record<string, unknown>;
}

export interface AppearanceData {
  themeId: string;
  primaryColor: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  buttonStyle: string | null;
  borderStyle: string | null;
  shadowStyle: string | null;
  fontFamily: string | null;
  animation: string | null;
  layout: string | null;
  // Deep Theme Engine customization — see
  // design-system/architecture/theme-engine.md and themes/types.ts ThemeOverrides.
  themeOverrides: Record<string, unknown> | null;
  favoriteThemeKeys?: string[];
  theme?: ThemeData;
}
