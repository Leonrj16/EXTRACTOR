"use client";

import { ColorField } from "@/components/ui/color-field";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { BUTTON_BLOCK_DEFAULT_META } from "./config";
import type { ButtonBlockMeta } from "./types";

const SIZE_OPTIONS = [
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Medio" },
  { value: "lg", label: "Grande" },
];

export function ButtonBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<ButtonBlockMeta>) {
  const resolved = { ...BUTTON_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="button-title">Texto</Label>
        <Input
          id="button-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="button-url">URL</Label>
        <Input
          id="button-url"
          type="url"
          placeholder="https://…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="button-icon">Ícono (opcional)</Label>
        <Input
          id="button-icon"
          placeholder="instagram, whatsapp, link…"
          value={link.icon ?? ""}
          onChange={(e) => onPatch({ icon: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          id="button-color"
          label="Color (opcional)"
          value={resolved.color ?? "#7c3aed"}
          onChange={(color) => onMetaChange({ color })}
        />
        <FieldSelect
          id="button-size"
          label="Tamaño"
          value={resolved.size ?? "md"}
          onChange={(size) => onMetaChange({ size: size as ButtonBlockMeta["size"] })}
          options={SIZE_OPTIONS}
        />
      </div>
    </div>
  );
}
