"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlockSettingsProps } from "../types";
import { FAQ_BLOCK_DEFAULT_META } from "./config";
import type { FaqBlockMeta } from "./types";

export function FaqBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<FaqBlockMeta>) {
  const resolved = { ...FAQ_BLOCK_DEFAULT_META, ...meta };
  const items = resolved.items ?? [];

  function updateItem(i: number, patch: Partial<{ question: string; answer: string }>) {
    const next = items.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
    onMetaChange({ items: next });
  }

  function removeItem(i: number) {
    onMetaChange({ items: items.filter((_, idx) => idx !== i) });
  }

  function addItem() {
    onMetaChange({ items: [...items, { question: "", answer: "" }] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="faq-title">Título (opcional)</Label>
        <Input
          id="faq-title"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Pregunta"
                value={item.question}
                onChange={(e) => updateItem(i, { question: e.target.value })}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeItem(i)}
                aria-label="Quitar pregunta"
              >
                <Trash2 />
              </Button>
            </div>
            <Textarea
              rows={2}
              placeholder="Respuesta"
              value={item.answer}
              onChange={(e) => updateItem(i, { answer: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addItem}>
        <Plus />
        Agregar pregunta
      </Button>
    </div>
  );
}
