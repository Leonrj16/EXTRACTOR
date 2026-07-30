"use client";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { BlockFrame } from "../shared/block-frame";
import { resolveBlockStyle } from "../shared/style-resolver";
import type { BlockPreviewProps } from "../types";
import { FAQ_BLOCK_INTERACTIVE } from "./animation";
import { FAQ_BLOCK_DEFAULT_META } from "./config";
import { FAQ_CARD_CLASS } from "./styles";
import type { FaqBlockMeta } from "./types";

export function FaqBlockPreview({
  link,
  meta,
  styleOverrides,
  theme,
  index,
}: BlockPreviewProps<FaqBlockMeta>) {
  const resolved = { ...FAQ_BLOCK_DEFAULT_META, ...meta };
  const items = (resolved.items ?? []).filter((item) => item.question.trim());

  const style = resolveBlockStyle(styleOverrides, {
    primaryColor: theme.primaryColor,
    pageBorder: theme.pageBorder,
    pageShadow: theme.pageShadow,
  });

  if (items.length === 0) return null;

  return (
    <BlockFrame styleOverrides={styleOverrides} interactive={FAQ_BLOCK_INTERACTIVE} index={index}>
      <div className={`${FAQ_CARD_CLASS} ${theme.cardRadius}`} style={style}>
        {link.title && <p className="mb-2 text-sm font-medium">{link.title}</p>}
        <Accordion>
          {items.map((item, i) => (
            <AccordionItem key={i} value={String(i)}>
              <AccordionTrigger className="text-sm">{item.question}</AccordionTrigger>
              <AccordionPanel>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </BlockFrame>
  );
}
