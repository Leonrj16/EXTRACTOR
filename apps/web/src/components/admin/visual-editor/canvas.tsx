"use client";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Lock, Trash2 } from "lucide-react";
import { getBlockDefinition } from "@/components/blocks/registry";
import type { BlockStyleOverrides } from "@/components/blocks/types";
import { getResolvedDefinition, resolveTheme } from "@/themes/resolve-theme";
import { PARTICLE_DOTS } from "@/themes/shared/backgrounds";
import type { ThemeOverrides } from "@/themes/types";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";
import { cn } from "@/lib/utils";
import type { DeviceId } from "@/components/admin/design-editor";

interface CanvasProps {
  profile: ProfileData;
  appearance: AppearanceData;
  links: LinkItem[];
  selectedIds: string[];
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
  onToggleVisibility: (link: LinkItem) => void;
  onReorder: (reordered: LinkItem[]) => void;
  /** "Vista previa": hides all editing chrome so what's on screen is
   * exactly what a visitor would see. */
  previewMode: boolean;
  /** Which simulated breakpoint is active — used to honor
   * `styleOverrides.hiddenOn` the same way the public page's real CSS
   * media queries would, since this canvas' width is a simulated frame,
   * not the actual browser viewport (see resolveResponsiveVisibility). */
  device: DeviceId;
}

/**
 * The Visual Editor's canvas (see design-system/architecture/
 * visual-editor.md). Deliberately duplicates ProfileView's page chrome
 * (background/avatar/name/bio) instead of reusing that component with an
 * "editable" mode bolted on — both call the exact same `getResolvedDefinition`
 * + `resolveTheme`, so the look never drifts, but the already-shipped public
 * page's render code stays completely untouched by this feature.
 */
export function Canvas({
  profile,
  appearance,
  links,
  selectedIds,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onReorder,
  previewMode,
  device,
}: CanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const definition = getResolvedDefinition(
    appearance.theme?.key,
    appearance.theme?.layout,
    appearance.theme?.baseConfig,
  );
  const resolved = resolveTheme(
    definition,
    {
      primaryColor: appearance.primaryColor,
      backgroundColor: appearance.backgroundColor,
      buttonStyle: appearance.buttonStyle,
      borderStyle: appearance.borderStyle,
      shadowStyle: appearance.shadowStyle,
      fontFamily: appearance.fontFamily,
      animation: appearance.animation,
      layout: appearance.layout,
    },
    appearance.themeOverrides as ThemeOverrides | null,
  );

  const {
    layout,
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    fontFamilyCss,
    headingWeight,
    bodyWeight,
    typographyStyle,
    buttonRadiusClass: radius,
    cardRadiusClass: cardRadius,
    pageBorder: blockBorder,
    pageShadow: blockShadow,
    buttonTreatment,
    background,
  } = resolved;

  const WIDE_TYPES: LinkItem["type"][] = ["VIDEO", "MUSIC", "FORM", "HERO", "PROFILE", "FOOTER", "LOCATION", "CUSTOM_HTML"];
  function isWide(link: LinkItem) {
    return layout === "grid" && WIDE_TYPES.includes(link.type);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(links, oldIndex, newIndex));
  }

  return (
    <div
      className="relative flex min-h-full flex-col items-center gap-6 overflow-hidden px-6 py-14 text-center"
      style={{
        ...background.style,
        color: primaryColor,
        fontFamily: fontFamilyCss,
        ...typographyStyle,
        backgroundImage: appearance.backgroundImage ? `url(${appearance.backgroundImage})` : background.style.backgroundImage,
        backgroundSize: "cover",
      }}
    >
      {background.decoration === "aurora" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-[-20%] top-[-15%] size-[70%] rounded-full blur-[90px]"
            style={{ backgroundColor: `${primaryColor}40` }}
          />
          <div
            className="absolute right-[-20%] top-[5%] size-[65%] rounded-full blur-[100px]"
            style={{ backgroundColor: `${secondaryColor}30` }}
          />
        </div>
      )}

      {background.decoration === "video" && background.videoUrl && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <video src={background.videoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          {!!background.overlayOpacity && (
            <div className="absolute inset-0" style={{ backgroundColor: `#000000${Math.round(background.overlayOpacity * 255).toString(16).padStart(2, "0")}` }} />
          )}
        </div>
      )}

      {background.decoration === "particles" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLE_DOTS.map((dot, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full"
              style={{
                left: dot.left,
                width: dot.size,
                height: dot.size,
                backgroundColor: `${primaryColor}88`,
                animation: `particle-float ${dot.duration}s ease-in-out infinite`,
                animationDelay: `${dot.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {profile.coverUrl && (
        <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${backgroundColor})` }} />
        </div>
      )}

      <div
        className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-2"
        style={{ borderColor: primaryColor, marginTop: profile.coverUrl ? "1rem" : undefined }}
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-black/10" />
        )}
      </div>

      <div className="relative z-10">
        <p className="text-lg" style={{ fontWeight: headingWeight }}>
          {profile.displayName}
        </p>
        {profile.bio && (
          <p className="mt-1 max-w-xs text-sm opacity-80" style={{ fontWeight: bodyWeight }}>
            {profile.bio}
          </p>
        )}
      </div>

      {links.length === 0 ? (
        <p className="relative z-10 rounded-xl border border-dashed border-border/60 bg-black/10 px-6 py-8 text-sm opacity-70">
          Agrega tu primer bloque desde la biblioteca de la izquierda.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div
              className={cn(
                "relative z-10 w-full max-w-sm gap-3",
                layout === "grid" ? "grid grid-cols-2" : "flex flex-col",
              )}
            >
              {links.map((link, index) => {
                const linkDefinition = getBlockDefinition(link.type);
                if (!linkDefinition) return null;
                const hiddenOn = (link.styleOverrides as BlockStyleOverrides | null)?.hiddenOn;
                const hiddenOnDevice = hiddenOn?.includes(device) ?? false;
                // In "Vista previa" this must match exactly what a real
                // visitor on this device would see — skip the block
                // entirely, the same rule ProfileView's previewDevice
                // prop applies.
                if (previewMode && hiddenOnDevice) return null;
                const Preview = linkDefinition.Preview;
                return (
                  <CanvasBlockItem
                    key={link.id}
                    link={link}
                    wide={isWide(link)}
                    selected={selectedIds.includes(link.id)}
                    previewMode={previewMode}
                    hiddenOnDevice={hiddenOnDevice}
                    onSelect={(e) => onSelect(link.id, e)}
                    onDuplicate={() => onDuplicate(link)}
                    onDelete={() => onDelete(link)}
                    onToggleVisibility={() => onToggleVisibility(link)}
                  >
                    <Preview
                      link={link}
                      meta={link.metadata ?? {}}
                      styleOverrides={(link.styleOverrides ?? {}) as BlockStyleOverrides}
                      theme={{
                        primaryColor,
                        secondaryColor,
                        accentColor,
                        buttonTreatment,
                        radius,
                        cardRadius,
                        pageBorder: blockBorder,
                        pageShadow: blockShadow,
                        previewDevice: device,
                      }}
                      index={index}
                    />
                  </CanvasBlockItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function CanvasBlockItem({
  link,
  wide,
  selected,
  previewMode,
  hiddenOnDevice,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  children,
}: {
  link: LinkItem;
  wide: boolean;
  selected: boolean;
  previewMode: boolean;
  hiddenOnDevice: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  children: React.ReactNode;
}) {
  const locked = (link.styleOverrides as BlockStyleOverrides | null)?.locked ?? false;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    disabled: locked || previewMode,
  });

  if (previewMode) {
    return <div className={wide ? "col-span-2" : undefined}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group/canvas-item relative rounded-xl outline-2 outline-offset-2 outline-transparent transition-[outline-color]",
        selected && "outline-brand-purple",
        !selected && "hover:outline-border-strong",
        isDragging && "opacity-40",
        wide && "col-span-2",
        (!link.isActive || hiddenOnDevice) && "opacity-40",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
    >
      {hiddenOnDevice && (
        <span className="pointer-events-none absolute -top-2.5 left-1 z-20 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow">
          Oculto en este dispositivo
        </span>
      )}
      <div className="pointer-events-none absolute -top-3 right-1 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5 opacity-0 shadow-lg transition-opacity group-hover/canvas-item:pointer-events-auto group-hover/canvas-item:opacity-100 data-[selected=true]:pointer-events-auto data-[selected=true]:opacity-100"
        data-selected={selected}
      >
        {!locked && (
          <button
            {...attributes}
            {...listeners}
            aria-label="Arrastrar para reordenar"
            className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-3.5" />
          </button>
        )}
        <button
          aria-label={link.isActive ? "Ocultar bloque" : "Mostrar bloque"}
          className="flex size-6 items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
        >
          {link.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        </button>
        {!locked && (
          <button
            aria-label="Duplicar bloque"
            className="flex size-6 items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="size-3.5" />
          </button>
        )}
        {locked && (
          <span className="flex size-6 items-center justify-center rounded text-muted-foreground" title="Bloqueado">
            <Lock className="size-3.5" />
          </span>
        )}
        {!locked && (
          <button
            aria-label="Eliminar bloque"
            className="flex size-6 items-center justify-center rounded text-muted-foreground outline-none hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
