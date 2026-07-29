"use client";

import { useEffect } from "react";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";
import { ProfileView } from "./profile-view";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function track(username: string, body: Record<string, unknown>) {
  const url = `${API_URL}/public/${username}/track`;
  const payload = JSON.stringify(body);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
  } else {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
  }
}

interface PublicProfileClientProps {
  username: string;
  profile: ProfileData;
  appearance: AppearanceData;
  links: LinkItem[];
}

export function PublicProfileClient({ username, profile, appearance, links }: PublicProfileClientProps) {
  useEffect(() => {
    track(username, { type: "PAGE_VIEW", referrer: document.referrer || undefined });
  }, [username]);

  function handleLinkClick(link: LinkItem) {
    track(username, { type: "LINK_CLICK", linkId: link.id });
  }

  return (
    <ProfileView
      profile={profile}
      appearance={appearance}
      links={links}
      onLinkClick={handleLinkClick}
      className="min-h-screen"
    />
  );
}
