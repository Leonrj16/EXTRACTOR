"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { WHATSAPP_BLOCK_DEFAULT_META, WHATSAPP_BLOCK_ICON } from "./config";
import { WHATSAPP_BLOCK_INTERACTIVE } from "./animation";
import { WHATSAPP_BUTTON_CLASS } from "./styles";
import type { WhatsAppBlockMeta } from "./types";

export function WhatsAppBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<WhatsAppBlockMeta>) {
  const resolved = { ...WHATSAPP_BLOCK_DEFAULT_META, ...meta };
  // Phone/message build the link when set; otherwise fall back to
  // link.url as-is so pre-existing WHATSAPP rows (created before this
  // block existed, storing a full wa.me URL directly) keep working.
  const href = resolved.phone
    ? `https://wa.me/${resolved.phone.replace(/\D/g, "")}${
        resolved.message ? `?text=${encodeURIComponent(resolved.message)}` : ""
      }`
    : (link.url ?? "#");
  const Icon = WHATSAPP_BLOCK_ICON;
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={WHATSAPP_BLOCK_INTERACTIVE} index={index}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`${WHATSAPP_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
        style={{ ...treatment.style, ...style }}
      >
        <Icon className="size-4" />
        {link.title}
      </a>
    </BlockFrame>
  );
}
