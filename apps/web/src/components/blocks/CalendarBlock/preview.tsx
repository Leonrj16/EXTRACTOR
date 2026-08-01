"use client";

import { CalendarClock } from "lucide-react";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { CALENDAR_BLOCK_DEFAULT_META } from "./config";
import { CALENDAR_BLOCK_INTERACTIVE } from "./animation";
import { CALENDAR_BUTTON_CLASS, CALENDAR_CARD_CLASS, CALENDAR_ICON_WRAPPER_CLASS } from "./styles";
import type { CalendarBlockMeta } from "./types";

export function CalendarBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<CalendarBlockMeta>) {
  const resolved = { ...CALENDAR_BLOCK_DEFAULT_META, ...meta };
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const content = (
    <div className={`${CALENDAR_CARD_CLASS} ${theme.cardRadius}`} style={style}>
      <div
        className={CALENDAR_ICON_WRAPPER_CLASS}
        style={{ backgroundColor: `${theme.primaryColor}1f`, color: theme.primaryColor }}
      >
        <CalendarClock className="size-5" />
      </div>
      <span className="text-sm font-medium">{link.title}</span>
      {resolved.description && <p className="text-xs opacity-70">{resolved.description}</p>}
      {link.url && (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => onLinkClick?.(link)}
          className={`${CALENDAR_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
          style={treatment.style}
        >
          {resolved.buttonLabel ?? "Agendar"}
        </a>
      )}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={CALENDAR_BLOCK_INTERACTIVE} index={index}>
      {content}
    </BlockFrame>
  );
}
