"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { TEXT_BLOCK_DEFAULT_META, TEXT_SIZE_OPTIONS } from "./config";
import type { TextBlockMeta } from "./types";

export function TextBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<TextBlockMeta>) {
  const resolved = { ...TEXT_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="text-title">Título (opcional)</Label>
        <Input id="text-title" value={link.title} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="text-body">Texto</Label>
        <Textarea
          id="text-body"
          rows={4}
          value={resolved.body ?? ""}
          onChange={(e) => onMetaChange({ body: e.target.value })}
        />
      </div>

      <FieldSelect
        id="text-size"
        label="Tamaño"
        value={resolved.size ?? "md"}
        onChange={(size) => onMetaChange({ size: size as TextBlockMeta["size"] })}
        options={TEXT_SIZE_OPTIONS}
      />
    </div>
  );
}
