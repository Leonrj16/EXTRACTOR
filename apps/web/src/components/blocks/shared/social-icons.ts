import {
  Briefcase,
  Camera,
  Code2,
  MessageCircle,
  Music2,
  Play,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "github"
  | "x"
  | "threads";

// lucide-react ships no brand/logo icons — these are the closest generic
// stand-ins (camera for a photo network, a music note for TikTok, etc.)
// instead of pulling in a whole extra icon package for eight glyphs.
export const SOCIAL_PLATFORM_ICON: Record<SocialPlatform, LucideIcon> = {
  instagram: Camera,
  facebook: Users,
  tiktok: Music2,
  youtube: Play,
  linkedin: Briefcase,
  github: Code2,
  x: X,
  threads: MessageCircle,
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X (Twitter)",
  threads: "Threads",
};

export const SOCIAL_PLATFORM_OPTIONS = (Object.keys(SOCIAL_PLATFORM_LABELS) as SocialPlatform[]).map(
  (value) => ({ value, label: SOCIAL_PLATFORM_LABELS[value] }),
);
