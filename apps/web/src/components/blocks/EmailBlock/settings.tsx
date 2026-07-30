"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { EMAIL_BLOCK_DEFAULT_META } from "./config";
import type { EmailBlockMeta } from "./types";

export function EmailBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<EmailBlockMeta>) {
  const resolved = { ...EMAIL_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-title">Texto del botón</Label>
        <Input
          id="email-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-address">Email</Label>
        <Input
          id="email-address"
          type="email"
          placeholder="hola@ejemplo.com"
          value={resolved.email ?? ""}
          onChange={(e) => onMetaChange({ email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email-subject">Asunto (opcional)</Label>
          <Input
            id="email-subject"
            value={resolved.subject ?? ""}
            onChange={(e) => onMetaChange({ subject: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email-body">Cuerpo (opcional)</Label>
          <Input
            id="email-body"
            value={resolved.body ?? ""}
            onChange={(e) => onMetaChange({ body: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-url">Link manual (opcional, usado si no hay email)</Label>
        <Input
          id="email-url"
          type="url"
          placeholder="mailto:…"
          value={link.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value })}
        />
      </div>
    </div>
  );
}
