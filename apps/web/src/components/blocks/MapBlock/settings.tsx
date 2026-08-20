"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { MAP_BLOCK_DEFAULT_META } from "./config";
import type { MapBlockMeta } from "./types";

export function MapBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<MapBlockMeta>) {
  const resolved = { ...MAP_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="map-title">Título (opcional)</Label>
        <Input
          id="map-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="map-address">Dirección</Label>
        <Input
          id="map-address"
          placeholder="Av. Reforma 123, Ciudad de México"
          value={resolved.address ?? ""}
          onChange={(e) => onMetaChange({ address: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="map-url">Link de &quot;Abrir en Maps&quot; (opcional)</Label>
        <Input
          id="map-url"
          type="url"
          placeholder="https://maps.app.goo.gl/…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>
    </div>
  );
}
