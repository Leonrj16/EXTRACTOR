"use client";

import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import { resolveButtonTreatment } from "@/themes/shared/button-treatments";
import type { BlockPreviewProps } from "../types";
import { PRODUCT_BLOCK_DEFAULT_META } from "./config";
import { PRODUCT_BLOCK_INTERACTIVE } from "./animation";
import { PRODUCT_BUY_BUTTON_CLASS, PRODUCT_CARD_CLASS } from "./styles";
import type { ProductBlockMeta } from "./types";

export function ProductBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
  onLinkClick,
}: BlockPreviewProps<ProductBlockMeta>) {
  const resolved = { ...PRODUCT_BLOCK_DEFAULT_META, ...meta };
  const treatment = resolveButtonTreatment(theme.buttonTreatment ?? "filled", theme.primaryColor, theme.secondaryColor);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={PRODUCT_BLOCK_INTERACTIVE} index={index}>
      <a
        href={link.url ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`${PRODUCT_CARD_CLASS} ${theme.cardRadius}`}
        style={style}
      >
        {link.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.imageUrl} alt={link.title} className="aspect-square w-full object-cover" />
        )}
        <div className="flex flex-col gap-1 p-3">
          <span className="text-sm font-medium">{link.title}</span>
          {resolved.description && <p className="text-xs opacity-70">{resolved.description}</p>}
          <div className="flex items-center gap-2">
            {resolved.discountPrice && (
              <span className="text-xs opacity-50 line-through">
                {resolved.currency} {resolved.discountPrice}
              </span>
            )}
            {resolved.price && (
              <span className="text-sm font-semibold">
                {resolved.currency} {resolved.price}
              </span>
            )}
          </div>
          <span className={`${PRODUCT_BUY_BUTTON_CLASS} ${theme.radius} ${treatment.className}`} style={treatment.style}>
            {resolved.buttonLabel ?? "Comprar"}
          </span>
        </div>
      </a>
    </BlockFrame>
  );
}
