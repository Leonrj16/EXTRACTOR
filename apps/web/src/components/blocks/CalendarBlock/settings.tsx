"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { CALENDAR_BLOCK_DEFAULT_META } from "./config";
import type { CalendarBlockMeta } from "./types";

export function CalendarBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<CalendarBlockMeta>) {
  const resolved = { ...CALENDAR_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="calendar-title">Título</Label>
        <Input id="calendar-title" value={link.title} onChange={(e) => onPatch({ title: e.target.value })} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="calendar-description">Descripción (opcional)</Label>
        <Textarea
          id="calendar-description"
          rows={2}
          value={resolved.description ?? ""}
          onChange={(e) => onMetaChange({ description: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="calendar-url">Enlace de reservas (Calendly, Cal.com…)</Label>
        <Input
          id="calendar-url"
          type="url"
          placeholder="https://calendly.com/…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="calendar-button-label">Texto del botón</Label>
        <Input
          id="calendar-button-label"
          placeholder="Agendar"
          value={resolved.buttonLabel ?? ""}
          onChange={(e) => onMetaChange({ buttonLabel: e.target.value })}
        />
      </div>
    </div>
  );
}
