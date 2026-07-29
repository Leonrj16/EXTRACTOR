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
}

export interface AppearanceData {
  themeId: string;
  primaryColor: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  buttonStyle: string | null;
  fontFamily: string | null;
  animation: string | null;
  layout: string | null;
  theme?: ThemeData & {
    baseConfig: Record<string, string> & { aurora?: boolean };
  };
}
