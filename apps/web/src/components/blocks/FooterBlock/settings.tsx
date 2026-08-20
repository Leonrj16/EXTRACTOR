"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { FOOTER_BLOCK_DEFAULT_META } from "./config";
import type { FooterBlockMeta } from "./types";

export function FooterBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<FooterBlockMeta>) {
  const resolved = { ...FOOTER_BLOCK_DEFAULT_META, ...meta };
  const links = resolved.links ?? [];

  function updateLink(i: number, patch: Partial<{ label: string; url: string }>) {
    const next = links.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onMetaChange({ links: next });
  }

  function removeLink(i: number) {
    onMetaChange({ links: links.filter((_, idx) => idx !== i) });
  }

  function addLink() {
    onMetaChange({ links: [...links, { label: "", url: "" }] });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="footer-title">Texto de copyright</Label>
        <Input
          id="footer-title"
          placeholder="© 2026 Mi Marca"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Enlaces (opcional)</Label>
        <div className="flex flex-col gap-2">
          {links.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input placeholder="Texto" value={l.label} onChange={(e) => updateLink(i, { label: e.target.value })} />
              <Input placeholder="https://…" value={l.url} onChange={(e) => updateLink(i, { url: e.target.value })} />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeLink(i)}
                aria-label="Quitar enlace"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addLink}>
          <Plus />
          Agregar enlace
        </Button>
      </div>
    </div>
  );
}
