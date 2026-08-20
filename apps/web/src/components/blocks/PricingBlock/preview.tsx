"use client";

import { Check } from "lucide-react";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { PRICING_BLOCK_DEFAULT_META, PRICING_PERIOD_LABEL } from "./config";
import { PRICING_BLOCK_INTERACTIVE } from "./animation";
import { PRICING_BUTTON_CLASS, PRICING_CARD_CLASS, PRICING_FEATURE_ITEM_CLASS } from "./styles";
import type { PricingBlockMeta } from "./types";

export function PricingBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<PricingBlockMeta>) {
  const resolved = { ...PRICING_BLOCK_DEFAULT_META, ...meta };
  const features = resolved.features ?? [];
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  if (resolved.highlighted) {
    style.borderColor = theme.primaryColor;
    style.borderWidth = style.borderWidth ?? "1.5px";
    style.borderStyle = style.borderStyle ?? "solid";
  }

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={PRICING_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      <div className={`${PRICING_CARD_CLASS} ${theme.cardRadius}`} style={style}>
        <span className="text-sm font-semibold">{link.title}</span>
        {resolved.price && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              {resolved.currency} {resolved.price}
            </span>
            <span className="text-xs opacity-60">{PRICING_PERIOD_LABEL[resolved.period ?? "month"]}</span>
          </div>
        )}
        {features.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {features.map((feature, i) => (
              <li key={i} className={PRICING_FEATURE_ITEM_CLASS}>
                <Check className="size-3.5 shrink-0" style={{ color: theme.primaryColor }} />
                {feature}
              </li>
            ))}
          </ul>
        )}
        {link.url && (
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onLinkClick?.(link)}
            className={`${PRICING_BUTTON_CLASS} ${theme.radius} ${treatment.className}`}
            style={treatment.style}
          >
            {resolved.buttonLabel ?? "Elegir plan"}
          </a>
        )}
      </div>
    </BlockFrame>
  );
}
