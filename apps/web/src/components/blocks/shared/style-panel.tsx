"use client";

import { useState } from "react";
import { ColorField } from "@/components/ui/color-field";
import { FieldSelect } from "@/components/ui/field-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockStyleOverrides, ResponsiveFieldOverrides } from "../types";

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
  { value: "rotate", label: "Rotar" },
  { value: "bounce", label: "Rebote" },
  { value: "none", label: "Sin animación" },
];

const HOVER_EFFECT_OPTIONS = [
  { value: "scale", label: "Escala" },
  { value: "lift", label: "Elevar" },
  { value: "glow", label: "Resplandor" },
  { value: "none", label: "Sin efecto" },
];

const RESPONSIVE_DEVICES = [
  { value: "desktop" as const, label: "Escritorio", Icon: Monitor },
  { value: "tablet" as const, label: "Tablet", Icon: Tablet },
  { value: "mobile" as const, label: "Móvil", Icon: Smartphone },
];

const INHERIT = "inherit";

const RESPONSIVE_PADDING_OPTIONS = [{ value: INHERIT, label: "Usar valor base" }, ...PADDING_OPTIONS];
const RESPONSIVE_MARGIN_OPTIONS = [{ value: INHERIT, label: "Usar valor base" }, ...MARGIN_OPTIONS];
const RESPONSIVE_WIDTH_OPTIONS = [{ value: INHERIT, label: "Usar valor base" }, ...WIDTH_OPTIONS];

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
  const [responsiveDevice, setResponsiveDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  function patchResponsiveField(field: keyof ResponsiveFieldOverrides, raw: string) {
    const current = value.responsive ?? {};
    const bucket: ResponsiveFieldOverrides = { ...current[responsiveDevice] };
    if (raw === INHERIT) delete bucket[field];
    else bucket[field] = raw as never;
    onChange({ responsive: { ...current, [responsiveDevice]: bucket } });
  }

  const activeBucket = value.responsive?.[responsiveDevice];

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

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldSelect
          id={`${idPrefix}-hover-effect`}
          label="Efecto al pasar el cursor"
          value={value.hoverEffect ?? "scale"}
          onChange={(v) => onChange({ hoverEffect: v as BlockStyleOverrides["hoverEffect"] })}
          options={HOVER_EFFECT_OPTIONS}
        />
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
          <div>
            <Label htmlFor={`${idPrefix}-scroll`}>Animar al hacer scroll</Label>
            <p className="text-xs text-muted-foreground">
              En vez de solo una vez al cargar la página
            </p>
          </div>
          <Switch
            id={`${idPrefix}-scroll`}
            checked={value.animateOnScroll ?? false}
            onCheckedChange={(animateOnScroll) => onChange({ animateOnScroll })}
            aria-label="Animar al hacer scroll"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Ocultar este bloque en
        </p>
        <div className="flex gap-2">
          {RESPONSIVE_DEVICES.map(({ value: device, label, Icon }) => {
            const hidden = value.hiddenOn?.includes(device) ?? false;
            return (
              <button
                key={device}
                type="button"
                aria-pressed={hidden}
                onClick={() => {
                  const current = value.hiddenOn ?? [];
                  const next = hidden
                    ? current.filter((d) => d !== device)
                    : [...current, device];
                  onChange({ hiddenOn: next });
                }}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs transition-colors ${
                  hidden
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Padding / margin / ancho por dispositivo
        </p>
        <div className="flex gap-2">
          {RESPONSIVE_DEVICES.map(({ value: device, label, Icon }) => {
            const active = device === responsiveDevice;
            const hasOverride = !!(
              value.responsive?.[device]?.padding ||
              value.responsive?.[device]?.margin ||
              value.responsive?.[device]?.width
            );
            return (
              <button
                key={device}
                type="button"
                aria-pressed={active}
                onClick={() => setResponsiveDevice(device)}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs transition-colors",
                  active
                    ? "border-brand-purple/60 bg-brand-purple/10 text-foreground"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
                {hasOverride && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand-purple" />
                )}
              </button>
            );
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <FieldSelect
            id={`${idPrefix}-responsive-padding`}
            label="Padding"
            value={activeBucket?.padding ?? INHERIT}
            onChange={(v) => patchResponsiveField("padding", v)}
            options={RESPONSIVE_PADDING_OPTIONS}
          />
          <FieldSelect
            id={`${idPrefix}-responsive-margin`}
            label="Margin"
            value={activeBucket?.margin ?? INHERIT}
            onChange={(v) => patchResponsiveField("margin", v)}
            options={RESPONSIVE_MARGIN_OPTIONS}
          />
          <FieldSelect
            id={`${idPrefix}-responsive-width`}
            label="Ancho"
            value={activeBucket?.width ?? INHERIT}
            onChange={(v) => patchResponsiveField("width", v)}
            options={RESPONSIVE_WIDTH_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
