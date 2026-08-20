"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { SERVICE_BLOCK_DEFAULT_META, SERVICE_ICON_MAP } from "./config";
import { SERVICE_BLOCK_INTERACTIVE } from "./animation";
import { SERVICE_BUTTON_CLASS, SERVICE_CARD_CLASS, SERVICE_ICON_WRAPPER_CLASS } from "./styles";
import type { ServiceBlockMeta } from "./types";

export function ServiceBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<ServiceBlockMeta>) {
  const resolved = { ...SERVICE_BLOCK_DEFAULT_META, ...meta };
  const Icon = SERVICE_ICON_MAP[resolved.icon ?? "sparkles"];
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const content = (
    <div className={`${SERVICE_CARD_CLASS} ${theme.cardRadius}`} style={style}>
      <div className={SERVICE_ICON_WRAPPER_CLASS} style={{ backgroundColor: `${theme.primaryColor}1f`, color: theme.primaryColor }}>
        <Icon className="size-5" />
      </div>
      <span className="text-sm font-medium">{link.title}</span>
      {resolved.description && <p className="text-xs opacity-70">{resolved.description}</p>}
      {resolved.price && (
        <span className="text-sm font-semibold">
          {resolved.currency} {resolved.price}
        </span>
      )}
      {link.url && (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => onLinkClick?.(link)}
          className={`${SERVICE_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
          style={treatment.style}
        >
          {resolved.buttonLabel ?? "Ver más"}
        </a>
      )}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={SERVICE_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      {content}
    </BlockFrame>
  );
}
