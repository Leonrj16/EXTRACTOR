"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { EMAIL_BLOCK_DEFAULT_META, EMAIL_BLOCK_ICON } from "./config";
import { EMAIL_BLOCK_INTERACTIVE } from "./animation";
import { EMAIL_BUTTON_CLASS } from "./styles";
import type { EmailBlockMeta } from "./types";

export function EmailBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<EmailBlockMeta>) {
  const resolved = { ...EMAIL_BLOCK_DEFAULT_META, ...meta };
  // email/subject/body build the mailto: link when set; otherwise fall
  // back to link.url as-is so pre-existing EMAIL rows (created before this
  // block existed, storing a mailto: link directly) keep working.
  const params = new URLSearchParams();
  if (resolved.subject) params.set("subject", resolved.subject);
  if (resolved.body) params.set("body", resolved.body);
  const query = params.toString();
  const href = resolved.email ? `mailto:${resolved.email}${query ? `?${query}` : ""}` : (link.url ?? "#");
  const Icon = EMAIL_BLOCK_ICON;
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={EMAIL_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      <a
        href={href}
        onClick={() => onLinkClick?.(link)}
        className={`${EMAIL_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
        style={{ ...treatment.style, ...style }}
      >
        <Icon className="size-4" />
        {link.title}
      </a>
    </BlockFrame>
  );
}
