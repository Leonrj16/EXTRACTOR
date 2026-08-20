"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BlockSettingsProps } from "../types";
import { VIDEO_BLOCK_DEFAULT_META } from "./config";
import type { VideoBlockMeta } from "./types";

const SOURCE_OPTIONS = [
  { value: "auto", label: "YouTube / Vimeo" },
  { value: "mp4", label: "Archivo de video (MP4)" },
];

export function VideoBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<VideoBlockMeta>) {
  const resolved = { ...VIDEO_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="video-title">Título</Label>
        <Input
          id="video-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <FieldSelect
        id="video-source"
        label="Origen"
        value={resolved.source ?? "auto"}
        onChange={(source) => onMetaChange({ source: source as VideoBlockMeta["source"] })}
        options={SOURCE_OPTIONS}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="video-url">
          {resolved.source === "mp4" ? "URL del archivo .mp4" : "URL de YouTube o Vimeo"}
        </Label>
        <Input
          id="video-url"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="video-thumbnail">Miniatura (opcional)</Label>
        <Input
          id="video-thumbnail"
          type="url"
          placeholder="https://…"
          value={link.imageUrl ?? ""}
          onChange={(e) => onPatch({ imageUrl: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-3">
        <div>
          <p className="text-sm font-medium">Reproducción automática</p>
          <p className="text-xs text-muted-foreground">Se reproduce sin sonido al cargar la página</p>
        </div>
        <Switch
          checked={resolved.autoplay ?? false}
          onCheckedChange={(autoplay) => onMetaChange({ autoplay })}
          aria-label="Reproducción automática"
        />
      </div>
    </div>
  );
}
