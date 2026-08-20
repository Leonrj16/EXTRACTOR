"use client";

import { ExternalLink } from "lucide-react";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { MAP_BLOCK_DEFAULT_META } from "./config";
import { MAP_BLOCK_INTERACTIVE } from "./animation";
import { MAP_IFRAME_CLASS, MAP_OPEN_BUTTON_CLASS } from "./styles";
import type { MapBlockMeta } from "./types";

export function MapBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<MapBlockMeta>) {
  const resolved = { ...MAP_BLOCK_DEFAULT_META, ...meta };
  const address = resolved.address?.trim();
  const embedUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : null;
  const openUrl = link.url || (address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}` : null);
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={MAP_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      <div className={theme.cardRadius} style={style}>
        {link.title && <p className="mb-2 px-1 text-sm font-medium">{link.title}</p>}
        {embedUrl ? (
          <iframe src={embedUrl} className={`${MAP_IFRAME_CLASS} ${theme.cardRadius}`} loading="lazy" />
        ) : (
          <div className={`flex aspect-video items-center justify-center text-xs opacity-60 ${theme.cardRadius}`}>
            Agrega una dirección para mostrar el mapa
          </div>
        )}
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => onLinkClick?.(link)}
            className={`${MAP_OPEN_BUTTON_CLASS} mt-2 ${theme.radius} ${treatment.className}`}
            style={treatment.style}
          >
            <ExternalLink className="size-4" />
            Abrir en Maps
          </a>
        )}
      </div>
    </BlockFrame>
  );
}
