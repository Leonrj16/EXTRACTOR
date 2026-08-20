"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { DIVIDER_BLOCK_DEFAULT_META, DIVIDER_STYLE_OPTIONS } from "./config";
import type { DividerBlockMeta } from "./types";

export function DividerBlockSettings({ meta, onMetaChange }: BlockSettingsProps<DividerBlockMeta>) {
  const resolved = { ...DIVIDER_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <FieldSelect
        id="divider-style"
        label="Estilo"
        value={resolved.style ?? "line"}
        onChange={(style) => onMetaChange({ style: style as DividerBlockMeta["style"] })}
        options={DIVIDER_STYLE_OPTIONS}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="divider-label">Etiqueta (opcional)</Label>
        <Input
          id="divider-label"
          placeholder="Más sobre mí"
          value={resolved.label ?? ""}
          onChange={(e) => onMetaChange({ label: e.target.value })}
        />
      </div>
    </div>
  );
}
