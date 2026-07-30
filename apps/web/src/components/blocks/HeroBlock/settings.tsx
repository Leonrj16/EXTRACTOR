"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { HERO_BLOCK_DEFAULT_META } from "./config";
import type { HeroBlockMeta } from "./types";

export function HeroBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<HeroBlockMeta>) {
  const resolved = { ...HERO_BLOCK_DEFAULT_META, ...meta };
  const buttons = resolved.buttons ?? [];

  function updateButton(i: number, patch: Partial<{ label: string; url: string }>) {
    onMetaChange({ buttons: buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });
  }

  function removeButton(i: number) {
    onMetaChange({ buttons: buttons.filter((_, idx) => idx !== i) });
  }

  function addButton() {
    onMetaChange({ buttons: [...buttons, { label: "", url: "" }] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="hero-title">Título</Label>
        <Input id="hero-title" value={link.title} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="hero-description">Descripción (opcional)</Label>
        <Textarea
          id="hero-description"
          rows={2}
          value={resolved.description ?? ""}
          onChange={(e) => onMetaChange({ description: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="hero-cover">Imagen de portada</Label>
        <Input
          id="hero-cover"
          placeholder="https://…"
          value={link.imageUrl ?? ""}
          onChange={(e) => onPatch({ imageUrl: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="hero-avatar">Avatar (opcional)</Label>
        <Input
          id="hero-avatar"
          placeholder="https://…"
          value={resolved.avatarUrl ?? ""}
          onChange={(e) => onMetaChange({ avatarUrl: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Botones</Label>
        <div className="flex flex-col gap-2">
          {buttons.map((button, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Texto"
                value={button.label}
                onChange={(e) => updateButton(i, { label: e.target.value })}
              />
              <Input
                placeholder="https://…"
                value={button.url}
                onChange={(e) => updateButton(i, { url: e.target.value })}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeButton(i)}
                aria-label="Quitar botón"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addButton}>
          <Plus />
          Agregar botón
        </Button>
      </div>
    </div>
  );
}
