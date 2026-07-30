"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { COUNTDOWN_BLOCK_DEFAULT_META } from "./config";
import type { CountdownBlockMeta } from "./types";

// <input type="datetime-local"> works in local time without a timezone
// suffix — converting through a Date round-trips it to/from the ISO string
// stored in metadata.
function toLocalInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CountdownBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<CountdownBlockMeta>) {
  const resolved = { ...COUNTDOWN_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="countdown-title">Título (opcional)</Label>
        <Input
          id="countdown-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="countdown-target">Fecha y hora objetivo</Label>
        <Input
          id="countdown-target"
          type="datetime-local"
          value={toLocalInputValue(resolved.targetDate)}
          onChange={(e) => {
            const value = e.target.value;
            onMetaChange({ targetDate: value ? new Date(value).toISOString() : undefined });
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="countdown-expired">Texto cuando termine</Label>
        <Input
          id="countdown-expired"
          value={resolved.expiredText ?? ""}
          onChange={(e) => onMetaChange({ expiredText: e.target.value })}
        />
      </div>
    </div>
  );
}
