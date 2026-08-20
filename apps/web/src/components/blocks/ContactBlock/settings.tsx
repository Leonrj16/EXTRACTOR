"use client";

import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { CONTACT_BLOCK_DEFAULT_META } from "./config";
import type { ContactBlockMeta } from "./types";

const MODE_OPTIONS = [
  { value: "form", label: "Formulario de contacto" },
  { value: "whatsapp", label: "Botón de WhatsApp" },
  { value: "email", label: "Botón de email" },
  { value: "phone", label: "Botón de teléfono" },
];

const CONTACT_PLACEHOLDER: Record<string, string> = {
  whatsapp: "+52 55 1234 5678",
  email: "hola@ejemplo.com",
  phone: "+52 55 1234 5678",
};

export function ContactBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<ContactBlockMeta>) {
  const resolved = { ...CONTACT_BLOCK_DEFAULT_META, ...meta };
  const mode = resolved.mode ?? "form";

  return (
    <div className="flex flex-col gap-4">
      <FieldSelect
        id="contact-mode"
        label="Tipo"
        value={mode}
        onChange={(value) => onMetaChange({ mode: value as ContactBlockMeta["mode"] })}
        options={MODE_OPTIONS}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-title">{mode === "form" ? "Título" : "Texto del botón"}</Label>
        <Input
          id="contact-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      {mode !== "form" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-value">{mode === "email" ? "Email" : "Teléfono"}</Label>
          <Input
            id="contact-value"
            placeholder={CONTACT_PLACEHOLDER[mode]}
            value={resolved.contact ?? ""}
            onChange={(e) => onMetaChange({ contact: e.target.value })}
          />
        </div>
      )}

      {mode === "form" && (
        <p className="rounded-xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-muted-foreground">
          Este bloque muestra un formulario (nombre, email y mensaje) en tu página pública. Los
          mensajes enviados quedan guardados y los puedes ver desde la lista de enlaces.
        </p>
      )}
    </div>
  );
}
