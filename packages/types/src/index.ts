export type LinkType =
  | 'LINK'
  | 'SOCIAL'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'LOCATION'
  | 'PRODUCT'
  | 'FORM';

export interface LinkDto {
  id: string;
  type: LinkType;
  title: string;
  url: string | null;
  icon: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  order: number;
}

export interface AppearanceDto {
  themeKey: string;
  primaryColor: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  buttonStyle: string | null;
  fontFamily: string | null;
}

export interface ProfileDto {
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
}

export interface PublicProfileResponse {
  profile: ProfileDto;
  appearance: AppearanceDto;
  links: LinkDto[];
}

export type AnalyticsEventType = 'PAGE_VIEW' | 'LINK_CLICK';
export type DeviceType = 'MOBILE' | 'TABLET' | 'DESKTOP' | 'UNKNOWN';

export interface TrackEventPayload {
  type: AnalyticsEventType;
  linkId?: string;
  device?: DeviceType;
  referrer?: string;
}

export interface AnalyticsSummaryDto {
  range: string;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  topLinks: Array<{ linkId: string; title: string; clicks: number }>;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}
