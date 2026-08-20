"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { SOCIAL_PLATFORM_OPTIONS, type SocialPlatform } from "../shared/social-icons";
import { PROFILE_BLOCK_DEFAULT_META } from "./config";
import type { ProfileBlockMeta, ProfileSocialLink } from "./types";

export function ProfileBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<ProfileBlockMeta>) {
  const resolved = { ...PROFILE_BLOCK_DEFAULT_META, ...meta };
  const socials = resolved.socials ?? [];

  function updateSocial(i: number, patch: Partial<ProfileSocialLink>) {
    onMetaChange({ socials: socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }

  function removeSocial(i: number) {
    onMetaChange({ socials: socials.filter((_, idx) => idx !== i) });
  }

  function addSocial() {
    onMetaChange({ socials: [...socials, { platform: "instagram", url: "" }] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">Nombre</Label>
        <Input id="profile-name" value={link.title} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-photo">Foto</Label>
        <Input
          id="profile-photo"
          placeholder="https://…"
          value={link.imageUrl ?? ""}
          onChange={(e) => onPatch({ imageUrl: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-role">Profesión (opcional)</Label>
          <Input
            id="profile-role"
            value={resolved.role ?? ""}
            onChange={(e) => onMetaChange({ role: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-location">Ubicación (opcional)</Label>
          <Input
            id="profile-location"
            value={resolved.location ?? ""}
            onChange={(e) => onMetaChange({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Redes sociales</Label>
        <div className="flex flex-col gap-2">
          {socials.map((social, i) => (
            <div key={i} className="flex items-center gap-2">
              <FieldSelect
                id={`profile-social-platform-${i}`}
                label=""
                value={social.platform}
                onChange={(platform) => updateSocial(i, { platform: platform as SocialPlatform })}
                options={SOCIAL_PLATFORM_OPTIONS}
              />
              <Input placeholder="https://…" value={social.url} onChange={(e) => updateSocial(i, { url: e.target.value })} />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeSocial(i)}
                aria-label="Quitar red social"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addSocial}>
          <Plus />
          Agregar red social
        </Button>
      </div>
    </div>
  );
}
