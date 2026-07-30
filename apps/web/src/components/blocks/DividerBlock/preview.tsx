"use client";

import { BlockFrame } from "../shared/block-frame";
import type { BlockPreviewProps } from "../types";
import { DIVIDER_BLOCK_DEFAULT_META } from "./config";
import { DIVIDER_BLOCK_INTERACTIVE } from "./animation";
import { DIVIDER_LABEL_CLASS, DIVIDER_WRAPPER_CLASS } from "./styles";
import type { DividerBlockMeta } from "./types";

function DividerLine({ style, color }: { style: NonNullable<DividerBlockMeta["style"]>; color: string }) {
  if (style === "space") return null;
  if (style === "dots") {
    return (
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
        ))}
      </div>
    );
  }
  return (
    <div
      className="h-px w-full"
      style={{
        borderTop: `1px ${style === "dashed" ? "dashed" : "solid"} ${color}`,
      }}
    />
  );
}

export function DividerBlockPreview({ meta, styleOverrides, theme, index }: BlockPreviewProps<DividerBlockMeta>) {
  const resolved = { ...DIVIDER_BLOCK_DEFAULT_META, ...meta };
  const color = `${theme.primaryColor}33`;

  const content = (
    <div className={DIVIDER_WRAPPER_CLASS}>
      <DividerLine style={resolved.style ?? "line"} color={color} />
      {resolved.label && <span className={DIVIDER_LABEL_CLASS}>{resolved.label}</span>}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={DIVIDER_BLOCK_INTERACTIVE} index={index}>
      {content}
    </BlockFrame>
  );
}
