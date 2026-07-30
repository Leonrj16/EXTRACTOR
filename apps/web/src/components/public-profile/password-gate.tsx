"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";
import { PublicProfileClient } from "./public-profile-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface UnlockedProfile extends ProfileData {
  appearance: AppearanceData;
  links: LinkItem[];
}

interface PasswordGateProps {
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

const sessionKey = (username: string) => `aura:unlocked:${username}`;

/**
 * Renders instead of `PublicProfileClient` when the profile route's server
 * fetch came back gated (see [username]/page.tsx). The unlock request runs
 * entirely client-side, one call per visitor — the ISR-cached page shell
 * never sees (or could leak) anyone's unlocked content, only this
 * component's own local state does, sourced fresh from a direct fetch.
 */
export function PasswordGate({ username, displayName, avatarUrl }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState<UnlockedProfile | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(sessionKey(username));
    if (cached) {
      try {
        setUnlocked(JSON.parse(cached));
      } catch {
        sessionStorage.removeItem(sessionKey(username));
      }
    }
  }, [username]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/${username}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Contraseña incorrecta");
        return;
      }

      const data: UnlockedProfile = await res.json();
      sessionStorage.setItem(sessionKey(username), JSON.stringify(data));
      setUnlocked(data);
    } finally {
      setLoading(false);
    }
  }

  if (unlocked) {
    const { appearance, links, ...profileData } = unlocked;
    return <PublicProfileClient username={username} profile={profileData} appearance={appearance} links={links} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#07080c] px-4 text-center text-white">
      <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <Lock className="size-6 opacity-70" />
        )}
      </div>
      <div>
        <h1 className="text-lg font-semibold">{displayName}</h1>
        <p className="mt-1 text-sm text-white/60">Esta página está protegida con contraseña.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="password"
          autoFocus
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-opacity disabled:opacity-60"
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
