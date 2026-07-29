"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  User,
  Palette,
  LayoutGrid,
  Blocks,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ProfileView } from "@/components/public-profile/profile-view";
import { adminFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData, ThemeData } from "@/types/profile";
import { LinkFormDialog } from "./link-form-dialog";
import { LinkRow, SortableLinkRow } from "./sortable-link-row";
import { SubmissionsDialog } from "./submissions-dialog";
import { useLinksManager } from "./use-links-manager";

const BUTTON_STYLES = [
  { value: "rounded", label: "Redondeado" },
  { value: "pill", label: "Píldora" },
  { value: "square", label: "Cuadrado" },
];

const BORDER_STYLES = [
  { value: "none", label: "Sin borde" },
  { value: "subtle", label: "Sutil" },
  { value: "solid", label: "Sólido" },
  { value: "thick", label: "Grueso" },
];

const SHADOW_STYLES = [
  { value: "none", label: "Sin sombra" },
  { value: "soft", label: "Suave" },
  { value: "glow", label: "Resplandor" },
];

const FONTS = ["Inter", "Poppins", "Roboto", "Playfair Display", "Space Grotesk"];

const LAYOUTS = [
  { value: "list", label: "Lista (clásico)" },
  { value: "grid", label: "Grid (bento)" },
];

const ANIMATIONS = [
  { value: "fade", label: "Aparecer" },
  { value: "slide", label: "Deslizar" },
  { value: "bounce", label: "Rebote" },
  { value: "none", label: "Sin animación" },
];

const TABS = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "theme", label: "Tema", icon: Palette },
  { id: "structure", label: "Estructura", icon: LayoutGrid },
  { id: "blocks", label: "Bloques", icon: Blocks },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DEVICES = [
  { id: "desktop", label: "Escritorio", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Móvil", icon: Smartphone },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

const DEVICE_FRAME: Record<DeviceId, { width: number; height: number; className: string }> = {
  mobile: { width: 300, height: 560, className: "rounded-[2.2rem] border-4 border-border" },
  tablet: { width: 420, height: 560, className: "rounded-[1.4rem] border-4 border-border" },
  desktop: { width: 640, height: 460, className: "rounded-xl border border-border" },
};

function FieldSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#12131c]">
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-2 px-2">
        <div
          className="size-6 shrink-0 rounded-lg border border-border-hover"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-muted-foreground uppercase">{value}</span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

// The right-hand column has a fixed width, so a wider device frame (tablet,
// desktop) can't just render at its "native" size — it has to shrink to
// fit, the same way a real design tool scales its canvas down instead of
// letting it overflow the panel.
const PREVIEW_CONTAINER_WIDTH = 300;

function PreviewFrame({ device, children }: { device: DeviceId; children: React.ReactNode }) {
  const frame = DEVICE_FRAME[device];
  const scale = Math.min(1, PREVIEW_CONTAINER_WIDTH / frame.width);
  const scaledHeight = frame.height * scale;

  const frameContent =
    device === "desktop" ? (
      <>
        <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-3 py-2">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-brand-warning/60" />
          <span className="size-2.5 rounded-full bg-brand-success/60" />
        </div>
        <div className="overflow-y-auto" style={{ height: frame.height }}>
          {children}
        </div>
      </>
    ) : (
      <>
        {device === "mobile" && (
          <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />
        )}
        <div className="overflow-y-auto" style={{ height: frame.height }}>
          {children}
        </div>
      </>
    );

  return (
    <div
      className="mx-auto"
      style={{ width: PREVIEW_CONTAINER_WIDTH, height: scaledHeight }}
    >
      <div
        className={cn("glow-purple-sm relative overflow-hidden bg-[#07080c]", frame.className)}
        style={{
          width: frame.width,
          height: frame.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {frameContent}
      </div>
    </div>
  );
}

interface DesignEditorProps {
  initialProfile: ProfileData;
  initialAppearance: AppearanceData;
  themes: ThemeData[];
  links: LinkItem[];
}

export function DesignEditor({ initialProfile, initialAppearance, themes, links }: DesignEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [appearance, setAppearance] = useState(initialAppearance);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [device, setDevice] = useState<DeviceId>("mobile");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const linksManager = useLinksManager(links);

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const media = await adminFetch<{ url: string }>("/admin/media/upload", {
      method: "POST",
      body: formData,
    });
    return media.url;
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file);
      setProfile((prev) => ({ ...prev, avatarUrl: url }));
      toast.success("Imagen subida, recuerda guardar el perfil");
    } catch {
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setProfile((prev) => ({ ...prev, coverUrl: url }));
      toast.success("Portada subida, recuerda guardar el perfil");
    } catch {
      toast.error("No se pudo subir la portada");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const updated = await adminFetch<ProfileData>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          coverUrl: profile.coverUrl,
          whatsapp: profile.whatsapp,
          contactEmail: profile.contactEmail,
          location: profile.location,
        }),
      });
      setProfile(updated);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("No se pudo guardar el perfil");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveAppearance() {
    setSavingAppearance(true);
    try {
      const updated = await adminFetch<AppearanceData>("/admin/appearance", {
        method: "PUT",
        body: JSON.stringify({
          themeId: appearance.themeId,
          primaryColor: appearance.primaryColor,
          backgroundColor: appearance.backgroundColor,
          buttonStyle: appearance.buttonStyle,
          borderStyle: appearance.borderStyle,
          shadowStyle: appearance.shadowStyle,
          fontFamily: appearance.fontFamily,
          animation: appearance.animation,
          layout: appearance.layout,
        }),
      });
      setAppearance(updated);
      toast.success("Apariencia actualizada");
    } catch {
      toast.error("No se pudo guardar la apariencia");
    } finally {
      setSavingAppearance(false);
    }
  }

  const base = appearance.theme?.baseConfig ?? {};

  return (
    <div className="glass grid overflow-hidden rounded-2xl lg:grid-cols-[220px_1fr_360px]">
      {/* Left rail — sections */}
      <div className="flex gap-1 border-b border-border-subtle p-3 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? "true" : undefined}
            aria-label={label}
            className={cn(
              "flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 lg:flex-none",
              activeTab === id
                ? "bg-surface-6 text-foreground"
                : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Center — active panel */}
      <div className="flex flex-col gap-4 border-b border-border-subtle p-6 lg:border-b-0 lg:border-r">
        {activeTab === "profile" && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-full bg-surface-5">
                  {profile.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {uploadingAvatar ? "Subiendo…" : "Cambiar foto"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-5">
                  {profile.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {uploadingCover ? "Subiendo…" : "Cambiar portada"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="displayName">Nombre</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Descripción</Label>
              <Textarea
                id="bio"
                maxLength={280}
                rows={3}
                value={profile.bio ?? ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={profile.whatsapp ?? ""}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="contactEmail">Email de contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={profile.contactEmail ?? ""}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={profile.location ?? ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-fit">
              {savingProfile ? "Guardando…" : "Guardar perfil"}
            </Button>
          </>
        )}

        {activeTab === "theme" && (
          <>
            <FieldSelect
              id="theme"
              label="Plantilla"
              value={appearance.themeId}
              onChange={(value) => setAppearance({ ...appearance, themeId: value })}
              options={themes.map((theme) => ({ value: theme.id, label: theme.name }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="primaryColor"
                label="Color principal"
                value={appearance.primaryColor ?? base.primaryColor ?? "#111827"}
                onChange={(value) => setAppearance({ ...appearance, primaryColor: value })}
              />
              <ColorField
                id="backgroundColor"
                label="Color de fondo"
                value={appearance.backgroundColor ?? base.backgroundColor ?? "#ffffff"}
                onChange={(value) => setAppearance({ ...appearance, backgroundColor: value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSelect
                id="borderStyle"
                label="Estilo de borde"
                value={appearance.borderStyle ?? base.borderStyle ?? "subtle"}
                onChange={(value) => setAppearance({ ...appearance, borderStyle: value })}
                options={BORDER_STYLES}
              />
              <FieldSelect
                id="shadowStyle"
                label="Estilo de sombra"
                value={appearance.shadowStyle ?? base.shadowStyle ?? "none"}
                onChange={(value) => setAppearance({ ...appearance, shadowStyle: value })}
                options={SHADOW_STYLES}
              />
            </div>
            <FieldSelect
              id="fontFamily"
              label="Tipografía"
              value={appearance.fontFamily ?? base.fontFamily ?? "Inter"}
              onChange={(value) => setAppearance({ ...appearance, fontFamily: value })}
              options={FONTS.map((font) => ({ value: font, label: font }))}
            />
            <Button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>
          </>
        )}

        {activeTab === "structure" && (
          <>
            <FieldSelect
              id="buttonStyle"
              label="Estilo de botones"
              value={appearance.buttonStyle ?? base.buttonStyle ?? "rounded"}
              onChange={(value) => setAppearance({ ...appearance, buttonStyle: value })}
              options={BUTTON_STYLES}
            />
            <FieldSelect
              id="layout"
              label="Estructura de plantilla"
              value={appearance.layout ?? appearance.theme?.layout ?? "list"}
              onChange={(value) => setAppearance({ ...appearance, layout: value })}
              options={LAYOUTS}
            />
            <FieldSelect
              id="animation"
              label="Animación de entrada"
              value={appearance.animation ?? base.animation ?? "fade"}
              onChange={(value) => setAppearance({ ...appearance, animation: value })}
              options={ANIMATIONS}
            />
            <Button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>
          </>
        )}

        {activeTab === "blocks" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Agrega, reordena, duplica u oculta los bloques de tu página.
              </p>
              <Button size="sm" onClick={linksManager.openCreateDialog}>
                <Plus className="size-4" />
                Nuevo bloque
              </Button>
            </div>

            {linksManager.links.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Todavía no tienes bloques. Crea el primero.
              </p>
            ) : (
              <DndContext
                sensors={linksManager.sensors}
                collisionDetection={closestCenter}
                onDragStart={linksManager.handleDragStart}
                onDragEnd={linksManager.handleDragEnd}
              >
                <SortableContext
                  items={linksManager.links.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3">
                    {linksManager.links.map((link) => (
                      <SortableLinkRow
                        key={link.id}
                        link={link}
                        onToggleActive={linksManager.handleToggleActive}
                        onEdit={linksManager.openEditDialog}
                        onDuplicate={linksManager.handleDuplicate}
                        onDelete={linksManager.handleDelete}
                        onViewMessages={
                          link.type === "FORM" ? linksManager.setMessagesLink : undefined
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {linksManager.activeLink && <LinkRow link={linksManager.activeLink} overlay />}
                </DragOverlay>
              </DndContext>
            )}
          </>
        )}
      </div>

      {/* Right — live preview */}
      <div className="flex flex-col items-center gap-3 bg-black/20 p-6">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Vista previa en vivo
        </p>
        <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              aria-current={device === id ? "true" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
                device === id
                  ? "bg-gradient-aura text-white"
                  : "text-muted-foreground hover:bg-surface-5 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <PreviewFrame device={device}>
          <ProfileView profile={profile} appearance={appearance} links={linksManager.links} />
        </PreviewFrame>
      </div>

      <LinkFormDialog
        open={linksManager.dialogOpen}
        onOpenChange={linksManager.setDialogOpen}
        link={linksManager.editingLink}
        onSubmit={linksManager.handleSubmit}
      />

      <SubmissionsDialog
        link={linksManager.messagesLink}
        onOpenChange={(open) => !open && linksManager.setMessagesLink(null)}
      />
    </div>
  );
}
