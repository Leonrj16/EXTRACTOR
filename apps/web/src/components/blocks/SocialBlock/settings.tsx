"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { SOCIAL_PLATFORM_OPTIONS } from "../shared/social-icons";
import { SOCIAL_BLOCK_DEFAULT_META } from "./config";
import type { SocialBlockMeta } from "./types";

export function SocialBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<SocialBlockMeta>) {
  const resolved = { ...SOCIAL_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <FieldSelect
        id="social-platform"
        label="Plataforma"
        value={resolved.platform ?? "instagram"}
        onChange={(platform) => onMetaChange({ platform: platform as SocialBlockMeta["platform"] })}
        options={SOCIAL_PLATFORM_OPTIONS}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="social-title">Texto</Label>
        <Input
          id="social-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="social-url">URL del perfil</Label>
        <Input
          id="social-url"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>
    </div>
  );
}
