"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { COUNTER_BLOCK_DEFAULT_META } from "./config";
import { COUNTER_ANIMATION_DURATION_S, COUNTER_BLOCK_INTERACTIVE } from "./animation";
import { COUNTER_CARD_CLASS, COUNTER_LABEL_CLASS, COUNTER_NUMBER_CLASS } from "./styles";
import type { CounterBlockMeta } from "./types";

export function CounterBlockPreview({ link, meta, styleOverrides, theme, index }: BlockPreviewProps<CounterBlockMeta>) {
  const resolved = { ...COUNTER_BLOCK_DEFAULT_META, ...meta };
  const target = resolved.value ?? 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, target, {
      duration: COUNTER_ANIMATION_DURATION_S,
      ease: "easeOut",
      onUpdate: (value) => setDisplay(Math.round(value)),
    });
    return () => controls.stop();
  }, [target]);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const content = (
    <div className={`${COUNTER_CARD_CLASS} ${theme.cardRadius}`} style={style}>
      <span className={COUNTER_NUMBER_CLASS} style={{ color: theme.primaryColor }}>
        {resolved.prefix}
        {display.toLocaleString()}
        {resolved.suffix}
      </span>
      {link.title && <span className={COUNTER_LABEL_CLASS}>{link.title}</span>}
    </div>
  );

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={COUNTER_BLOCK_INTERACTIVE} index={index}>
      {content}
    </BlockFrame>
  );
}
