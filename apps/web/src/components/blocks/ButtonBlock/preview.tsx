"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { BUTTON_BLOCK_DEFAULT_META } from "./config";
import { BUTTON_BLOCK_INTERACTIVE } from "./animation";
import { BUTTON_SIZE_CLASS } from "./styles";
import type { ButtonBlockMeta } from "./types";

export function ButtonBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<ButtonBlockMeta>) {
  const resolved = { ...BUTTON_BLOCK_DEFAULT_META, ...meta };
  const color = resolved.color ?? theme.primaryColor;

  // The page theme's button treatment (glass/gradient/glow/...) is the
  // base look; resolveBlockStyle's per-block overrides (a custom
  // background, border, shadow the user set on THIS button) still win —
  // see themes/shared/button-treatments.ts.
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", color, theme.secondaryColor);
  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: color,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={BUTTON_BLOCK_INTERACTIVE} index={index}>
      <a
        href={link.url ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`block w-full text-center font-medium outline-none transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${treatment.className} ${theme.radius} ${BUTTON_SIZE_CLASS[resolved.size ?? "md"]}`}
        style={{ ...treatment.style, ...style }}
      >
        {link.title}
      </a>
    </BlockFrame>
  );
}
