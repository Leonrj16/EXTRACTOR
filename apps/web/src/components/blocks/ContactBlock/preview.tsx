"use client";

import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { CONTACT_BLOCK_DEFAULT_META } from "./config";
import { CONTACT_BLOCK_INTERACTIVE } from "./animation";
import { CONTACT_BUTTON_CLASS } from "./styles";
import type { ContactBlockMeta } from "./types";

function DirectContactButton({
  mode,
  contact,
  label,
  className,
  style,
  onClick,
}: {
  mode: "whatsapp" | "email" | "phone";
  contact: string;
  label: string;
  className: string;
  style: React.CSSProperties;
  onClick?: () => void;
}) {
  const href =
    mode === "whatsapp"
      ? `https://wa.me/${contact.replace(/\D/g, "")}`
      : mode === "email"
        ? `mailto:${contact}`
        : `tel:${contact}`;
  const Icon = mode === "whatsapp" ? MessageCircle : mode === "email" ? Mail : Phone;

  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={className} style={style}>
      <Icon className="size-4" />
      {label}
    </a>
  );
}

function ContactForm({
  link,
  radius,
  style,
  onContactSubmit,
}: {
  link: BlockPreviewProps<ContactBlockMeta>["link"];
  radius: string;
  style: React.CSSProperties;
  onContactSubmit: BlockPreviewProps<ContactBlockMeta>["onContactSubmit"];
}) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!onContactSubmit) {
      setSent(true);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onContactSubmit(link, values);
      setSent(true);
      setValues({ name: "", email: "", message: "" });
    } catch {
      setError("No se pudo enviar el mensaje, intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className={`px-4 py-6 text-center text-sm ${radius}`} style={style}>
        ¡Gracias! Tu mensaje fue enviado.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-2 p-4 text-left ${radius}`} style={style}>
      <p className="text-sm font-medium">{link.title}</p>
      <Input
        required
        placeholder="Nombre"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
      />
      <Input
        required
        type="email"
        placeholder="Email"
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      <Textarea
        required
        rows={3}
        placeholder="Mensaje"
        value={values.message}
        onChange={(e) => setValues({ ...values, message: e.target.value })}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" loading={sending}>
        {sending ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}

export function ContactBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
  onContactSubmit,
}: BlockPreviewProps<ContactBlockMeta>) {
  const resolved = { ...CONTACT_BLOCK_DEFAULT_META, ...meta };
  const mode = resolved.mode ?? "form";
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={CONTACT_BLOCK_INTERACTIVE} index={index}>
      {mode === "form" ? (
        <ContactForm link={link} radius={theme.cardRadius} style={style} onContactSubmit={onContactSubmit} />
      ) : (
        <DirectContactButton
          mode={mode}
          contact={resolved.contact ?? ""}
          label={link.title}
          className={`${CONTACT_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
          style={{ ...treatment.style, ...style }}
          onClick={() => onLinkClick?.(link)}
        />
      )}
    </BlockFrame>
  );
}
