"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import type { MusicBlockMeta } from "./types";

export function MusicBlockSettings({ link, onPatch }: BlockSettingsProps<MusicBlockMeta>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="music-title">Título</Label>
        <Input
          id="music-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="music-url">URL de Spotify</Label>
        <Input
          id="music-url"
          type="url"
          placeholder="https://open.spotify.com/…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Pega la URL de una canción, álbum o playlist de Spotify
        </p>
      </div>
    </div>
  );
}
