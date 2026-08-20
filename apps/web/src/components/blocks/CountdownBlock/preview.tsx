"use client";

import { useEffect, useState } from "react";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { COUNTDOWN_BLOCK_DEFAULT_META } from "./config";
import { COUNTDOWN_BLOCK_INTERACTIVE } from "./animation";
import { COUNTDOWN_CARD_CLASS, COUNTDOWN_UNIT_CLASS } from "./styles";
import type { CountdownBlockMeta } from "./types";

function splitRemaining(ms: number) {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / 86_400_000);
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
}

export function CountdownBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
}: BlockPreviewProps<CountdownBlockMeta>) {
  const resolved = { ...COUNTDOWN_BLOCK_DEFAULT_META, ...meta };
  const target = resolved.targetDate ? new Date(resolved.targetDate).getTime() : null;

  // Computed only after mount so server and client render the same markup
  // on the first pass — a countdown can't be server-rendered accurately.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  const units = remaining !== null ? splitRemaining(remaining) : null;
  const expired = remaining !== null && remaining <= 0;

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={COUNTDOWN_BLOCK_INTERACTIVE} index={index} previewDevice={theme.previewDevice}>
      <div className={`${COUNTDOWN_CARD_CLASS} ${theme.cardRadius}`} style={style}>
        {link.title && <p className="text-sm font-medium">{link.title}</p>}
        {!target ? (
          <p className="text-xs opacity-60">Configura una fecha objetivo</p>
        ) : expired ? (
          <p className="text-sm font-semibold">{resolved.expiredText}</p>
        ) : units ? (
          <div className="flex gap-2">
            {(
              [
                ["Días", units.days],
                ["Hrs", units.hours],
                ["Min", units.minutes],
                ["Seg", units.seconds],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className={COUNTDOWN_UNIT_CLASS}>
                <span className="text-lg font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
                <span className="text-[10px] opacity-60 uppercase">{label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </BlockFrame>
  );
}
