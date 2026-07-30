import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PasswordGate } from "@/components/public-profile/password-gate";
import { PublicProfileClient } from "@/components/public-profile/public-profile-client";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";

export const revalidate = 60;

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

interface FullProfileResponse extends ProfileData {
  appearance: AppearanceData;
  links: LinkItem[];
}

// What the API returns for a password-protected profile instead of the
// full payload above — see PublicService.getPublicProfile. The real
// content only comes back from a client-side unlock call (PasswordGate),
// never through this server-rendered, ISR-cached route, since that cache
// is shared across every visitor regardless of whether they know the
// password.
interface GatedProfileResponse {
  isPasswordProtected: true;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

type PublicProfileResponse = FullProfileResponse | GatedProfileResponse;

const API_URL = process.env.API_URL ?? "http://localhost:3001/api";

async function getPublicProfile(username: string): Promise<PublicProfileResponse | null> {
  const res = await fetch(`${API_URL}/public/${username}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Perfil no encontrado" };

  return {
    title: profile.seoTitle ?? profile.displayName,
    description: profile.seoDescription ?? profile.bio ?? undefined,
    openGraph: {
      title: profile.seoTitle ?? profile.displayName,
      description: profile.seoDescription ?? profile.bio ?? undefined,
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  if (!("links" in profile)) {
    return <PasswordGate username={username} displayName={profile.displayName} avatarUrl={profile.avatarUrl} />;
  }

  const { appearance, links, ...profileData } = profile;

  return (
    <PublicProfileClient
      username={username}
      profile={profileData}
      appearance={appearance}
      links={links}
    />
  );
}
