"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { WHATSAPP_BLOCK_DEFAULT_META } from "./config";
import type { WhatsAppBlockMeta } from "./types";

export function WhatsAppBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<WhatsAppBlockMeta>) {
  const resolved = { ...WHATSAPP_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsapp-title">Texto del botón</Label>
        <Input
          id="whatsapp-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsapp-phone">Teléfono</Label>
        <Input
          id="whatsapp-phone"
          placeholder="+52 55 1234 5678"
          value={resolved.phone ?? ""}
          onChange={(e) => onMetaChange({ phone: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsapp-message">Mensaje pre-escrito (opcional)</Label>
        <Input
          id="whatsapp-message"
          placeholder="Hola, quiero más información…"
          value={resolved.message ?? ""}
          onChange={(e) => onMetaChange({ message: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsapp-url">Link manual (opcional, usado si no hay teléfono)</Label>
        <Input
          id="whatsapp-url"
          type="url"
          placeholder="https://wa.me/…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>
    </div>
  );
}
