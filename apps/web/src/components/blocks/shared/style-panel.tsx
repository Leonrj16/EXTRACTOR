"use client";

import { ColorField } from "@/components/ui/color-field";
import { FieldSelect } from "@/components/ui/field-select";
import type { BlockStyleOverrides } from "../types";

const PADDING_OPTIONS = [
  { value: "none", label: "Ninguno" },
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Medio" },
  { value: "lg", label: "Grande" },
];

const MARGIN_OPTIONS = PADDING_OPTIONS;

const BORDER_OPTIONS = [
  { value: "none", label: "Sin borde" },
  { value: "subtle", label: "Sutil" },
  { value: "solid", label: "Sólido" },
  { value: "thick", label: "Grueso" },
];

const RADIUS_OPTIONS = [
  { value: "none", label: "Ninguno" },
  { value: "sm", label: "Pequeño" },
  { value: "md", label: "Medio" },
  { value: "lg", label: "Grande" },
  { value: "full", label: "Completo" },
];

const SHADOW_OPTIONS = [
  { value: "none", label: "Sin sombra" },
  { value: "soft", label: "Suave" },
  { value: "glow", label: "Resplandor" },
];

const ALIGN_OPTIONS = [
  { value: "left", label: "Izquierda" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Derecha" },
];

const WIDTH_OPTIONS = [
  { value: "auto", label: "Automático" },
  { value: "full", label: "Completo" },
];

const ANIMATION_OPTIONS = [
  { value: "fade", label: "Aparecer" },
  { value: "slide", label: "Deslizar" },
  { value: "scale", label: "Escala" },
  { value: "none", label: "Sin animación" },
];

/**
 * The one style panel every block's `settings.tsx` renders after its own
 * fields — built once here instead of each block reimplementing padding/
 * margin/border/shadow controls. A block only needs to pass its current
 * `styleOverrides` and get a patch back.
 */
export function BlockStylePanel({
  value,
  onChange,
  idPrefix,
}: {
  value: BlockStyleOverrides;
  onChange: (patch: Partial<BlockStyleOverrides>) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle pt-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Estilo del bloque
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSelect
          id={`${idPrefix}-padding`}
          label="Padding"
          value={value.padding ?? "md"}
          onChange={(v) => onChange({ padding: v as BlockStyleOverrides["padding"] })}
          options={PADDING_OPTIONS}
        />
        <FieldSelect
          id={`${idPrefix}-margin`}
          label="Margin"
          value={value.margin ?? "none"}
          onChange={(v) => onChange({ margin: v as BlockStyleOverrides["margin"] })}
          options={MARGIN_OPTIONS}
        />
      </div>

      <ColorField
        id={`${idPrefix}-background`}
        label="Fondo"
        value={value.background ?? "#00000000"}
        onChange={(v) => onChange({ background: v })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSelect
          id={`${idPrefix}-border`}
          label="Borde"
          value={value.border ?? "subtle"}
          onChange={(v) => onChange({ border: v as BlockStyleOverrides["border"] })}
          options={BORDER_OPTIONS}
        />
        <FieldSelect
          id={`${idPrefix}-radius`}
          label="Border radius"
          value={value.radius ?? "md"}
          onChange={(v) => onChange({ radius: v as BlockStyleOverrides["radius"] })}
          options={RADIUS_OPTIONS}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSelect
          id={`${idPrefix}-shadow`}
          label="Sombra"
          value={value.shadow ?? "none"}
          onChange={(v) => onChange({ shadow: v as BlockStyleOverrides["shadow"] })}
          options={SHADOW_OPTIONS}
        />
        <FieldSelect
          id={`${idPrefix}-align`}
          label="Alineación"
          value={value.align ?? "center"}
          onChange={(v) => onChange({ align: v as BlockStyleOverrides["align"] })}
          options={ALIGN_OPTIONS}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSelect
          id={`${idPrefix}-width`}
          label="Ancho"
          value={value.width ?? "full"}
          onChange={(v) => onChange({ width: v as BlockStyleOverrides["width"] })}
          options={WIDTH_OPTIONS}
        />
        <FieldSelect
          id={`${idPrefix}-animation`}
          label="Animación de entrada"
          value={value.animation ?? "fade"}
          onChange={(v) => onChange({ animation: v as BlockStyleOverrides["animation"] })}
          options={ANIMATION_OPTIONS}
        />
      </div>
    </div>
  );
}
