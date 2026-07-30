"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockSettingsProps } from "../types";
import { COUNTER_BLOCK_DEFAULT_META } from "./config";
import type { CounterBlockMeta } from "./types";

export function CounterBlockSettings({ link, meta, onPatch, onMetaChange }: BlockSettingsProps<CounterBlockMeta>) {
  const resolved = { ...COUNTER_BLOCK_DEFAULT_META, ...meta };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="counter-label">Etiqueta</Label>
        <Input
          id="counter-label"
          placeholder="Clientes atendidos"
          value={link.title}
          onChange={(e) => onPatch({ title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="counter-value">Número</Label>
        <Input
          id="counter-value"
          type="number"
          value={resolved.value ?? 0}
          onChange={(e) => onMetaChange({ value: Number(e.target.value) || 0 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="counter-prefix">Prefijo (opcional)</Label>
          <Input
            id="counter-prefix"
            placeholder="+"
            value={resolved.prefix ?? ""}
            onChange={(e) => onMetaChange({ prefix: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="counter-suffix">Sufijo (opcional)</Label>
          <Input
            id="counter-suffix"
            placeholder="k+"
            value={resolved.suffix ?? ""}
            onChange={(e) => onMetaChange({ suffix: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
