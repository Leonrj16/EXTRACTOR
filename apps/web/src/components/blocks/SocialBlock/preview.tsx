"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { SOCIAL_PLATFORM_ICON } from "../shared/social-icons";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { SOCIAL_BLOCK_DEFAULT_META } from "./config";
import { SOCIAL_BLOCK_INTERACTIVE } from "./animation";
import { SOCIAL_BUTTON_CLASS } from "./styles";
import type { SocialBlockMeta } from "./types";

export function SocialBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<SocialBlockMeta>) {
  const resolved = { ...SOCIAL_BLOCK_DEFAULT_META, ...meta };
  const platform = resolved.platform ?? "instagram";
  const Icon = SOCIAL_PLATFORM_ICON[platform];
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={SOCIAL_BLOCK_INTERACTIVE} index={index}>
      <a
        href={link.url ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`${SOCIAL_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
        style={{ ...treatment.style, ...style }}
      >
        <Icon className="size-4" />
        {link.title}
      </a>
    </BlockFrame>
  );
}
