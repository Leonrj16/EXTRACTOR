import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicProfileClient } from "@/components/public-profile/public-profile-client";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";

export const revalidate = 60;

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

interface PublicProfileResponse extends ProfileData {
  appearance: AppearanceData;
  links: LinkItem[];
}

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
