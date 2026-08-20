"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { CUSTOM_HTML_BLOCK_DEFAULT_META } from "./config";
import type { CustomHtmlBlockMeta } from "./types";

export function CustomHtmlBlockSettings({ meta, onMetaChange }: BlockSettingsProps<CustomHtmlBlockMeta>) {
  const resolved = { ...CUSTOM_HTML_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="custom-html-code">Código HTML</Label>
        <Textarea
          id="custom-html-code"
          rows={8}
          className="font-mono text-xs"
          placeholder="<div>Tu embed aquí…</div>"
          value={resolved.html ?? ""}
          onChange={(e) => onMetaChange({ html: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Se renderiza en un iframe aislado — cualquier {"<script>"} dentro se ignora, no se ejecuta.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="custom-html-height">Alto (píxeles)</Label>
        <Input
          id="custom-html-height"
          type="number"
          min={50}
          max={2000}
          value={resolved.height ?? 200}
          onChange={(e) => onMetaChange({ height: Number(e.target.value) || 200 })}
        />
      </div>
    </div>
  );
}
