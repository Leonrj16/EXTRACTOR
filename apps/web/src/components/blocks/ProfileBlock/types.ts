import type { SocialPlatform } from "../shared/social-icons";

export interface ProfileSocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface ProfileBlockMeta {
  role?: string;
  location?: string;
  socials?: ProfileSocialLink[];
}
