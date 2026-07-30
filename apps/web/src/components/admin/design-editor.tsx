"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  User,
  Palette,
  LayoutGrid,
  Blocks,
  Monitor,
  Tablet,
  Smartphone,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/ui/color-field";
import { FieldSelect } from "@/components/ui/field-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileView } from "@/components/public-profile/profile-view";
import { adminFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { getResolvedDefinition } from "@/themes/resolve-theme";
import type { ThemeOverrides } from "@/themes/types";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData, ThemeData } from "@/types/profile";
import { SubmissionsDialog } from "./submissions-dialog";
import { ThemeCustomizePanel } from "./theme-customize-panel";
import { ThemeGallery } from "./theme-gallery";
import { useLinksManager } from "./use-links-manager";
import { VisualEditorWorkspace } from "./visual-editor/workspace";

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

const LAYOUTS = [
  { value: "list", label: "Lista (clásico)" },
  { value: "grid", label: "Grid (bento)" },
];

const ANIMATIONS = [
  { value: "fade", label: "Aparecer" },
  { value: "slide", label: "Deslizar" },
  { value: "scale", label: "Escala" },
  { value: "zoom", label: "Zoom" },
  { value: "glow", label: "Resplandor" },
  { value: "float", label: "Flotar" },
  { value: "parallax", label: "Parallax" },
  { value: "ripple", label: "Ondulación" },
  { value: "pulse", label: "Pulso" },
  { value: "none", label: "Sin animación" },
];

const TABS = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "gallery", label: "Galería", icon: LayoutTemplate },
  { id: "theme", label: "Tema", icon: Palette },
  { id: "structure", label: "Estructura", icon: LayoutGrid },
  { id: "blocks", label: "Editor Visual", icon: Blocks },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const DEVICES = [
  { id: "desktop", label: "Escritorio", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Móvil", icon: Smartphone },
] as const;

export type DeviceId = (typeof DEVICES)[number]["id"];

const DEVICE_FRAME: Record<DeviceId, { width: number; height: number; className: string }> = {
  mobile: { width: 300, height: 560, className: "rounded-[2.2rem] border-4 border-border" },
  tablet: { width: 420, height: 560, className: "rounded-[1.4rem] border-4 border-border" },
  desktop: { width: 640, height: 460, className: "rounded-xl border border-border" },
};

// The right-hand column has a fixed width, so a wider device frame (tablet,
// desktop) can't just render at its "native" size — it has to shrink to
// fit, the same way a real design tool scales its canvas down instead of
// letting it overflow the panel.
const PREVIEW_CONTAINER_WIDTH = 300;

export function PreviewFrame({
  device,
  children,
  containerWidth = PREVIEW_CONTAINER_WIDTH,
}: {
  device: DeviceId;
  children: React.ReactNode;
  containerWidth?: number;
}) {
  const frame = DEVICE_FRAME[device];
  const scale = Math.min(1, containerWidth / frame.width);
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
      style={{ width: containerWidth, height: scaledHeight }}
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

export function DesignEditor({ initialProfile, initialAppearance, themes: initialThemes, links }: DesignEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [appearance, setAppearance] = useState(initialAppearance);
  const [themeList, setThemeList] = useState(initialThemes);
  const [favoriteThemeKeys, setFavoriteThemeKeys] = useState(initialAppearance.favoriteThemeKeys ?? []);
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
          seoTitle: profile.seoTitle ?? "",
          seoDescription: profile.seoDescription ?? "",
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

  async function handlePublish(): Promise<boolean> {
    try {
      const updated = await adminFetch<ProfileData>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({ isPublished: true }),
      });
      setProfile(updated);
      toast.success("Tu página está publicada");
      return true;
    } catch {
      toast.error("No se pudo publicar la página");
      return false;
    }
  }

  async function handleSaveAppearance() {
    setSavingAppearance(true);
    try {
      await persistAppearance(appearance);
      toast.success("Apariencia actualizada");
    } catch {
      toast.error("No se pudo guardar la apariencia");
    } finally {
      setSavingAppearance(false);
    }
  }

  async function persistAppearance(next: AppearanceData) {
    const updated = await adminFetch<AppearanceData>("/admin/appearance", {
      method: "PUT",
      body: JSON.stringify({
        themeId: next.themeId,
        primaryColor: next.primaryColor,
        backgroundColor: next.backgroundColor,
        buttonStyle: next.buttonStyle,
        borderStyle: next.borderStyle,
        shadowStyle: next.shadowStyle,
        fontFamily: next.fontFamily,
        animation: next.animation,
        layout: next.layout,
        themeOverrides: next.themeOverrides,
      }),
    });
    setAppearance(updated);
    return updated;
  }

  async function handleApplyTheme(themeId: string) {
    try {
      await persistAppearance({ ...appearance, themeId, themeOverrides: null });
      toast.success("Tema aplicado");
    } catch {
      toast.error("No se pudo aplicar el tema");
    }
  }

  function handlePatchOverrides<K extends keyof ThemeOverrides>(section: K, patch: ThemeOverrides[K]) {
    const current = (appearance.themeOverrides ?? {}) as ThemeOverrides;
    setAppearance({
      ...appearance,
      themeOverrides: { ...current, [section]: { ...current[section], ...patch } },
    });
  }

  async function handleResetOverrides() {
    await persistAppearance({ ...appearance, themeOverrides: null });
    toast.success("Personalización restablecida");
  }

  async function handleSaveAsTheme(name: string) {
    const created = await adminFetch<ThemeData>("/admin/themes", {
      method: "POST",
      body: JSON.stringify({
        name,
        layout: resolvedDefinition.layout,
        baseConfig: {
          meta: { name, tagline: "Tema personalizado", categories: [] },
          layout: resolvedDefinition.layout,
          colors: { ...resolvedDefinition.colors, ...(appearance.themeOverrides as ThemeOverrides | null)?.colors },
          typography: { ...resolvedDefinition.typography, ...(appearance.themeOverrides as ThemeOverrides | null)?.typography },
          buttons: { ...resolvedDefinition.buttons, ...(appearance.themeOverrides as ThemeOverrides | null)?.buttons },
          cards: { ...resolvedDefinition.cards, ...(appearance.themeOverrides as ThemeOverrides | null)?.cards },
          animations: { ...resolvedDefinition.animations, ...(appearance.themeOverrides as ThemeOverrides | null)?.animations },
          effects: { ...resolvedDefinition.effects, ...(appearance.themeOverrides as ThemeOverrides | null)?.effects },
        },
      }),
    });
    setThemeList((prev) => [...prev, created]);
    await persistAppearance({ ...appearance, themeId: created.id, themeOverrides: null });
  }

  async function handleDuplicateTheme(theme: ThemeData) {
    const definition = getResolvedDefinition(theme.key, theme.layout, theme.baseConfig);
    try {
      const created = await adminFetch<ThemeData>("/admin/themes", {
        method: "POST",
        body: JSON.stringify({
          name: `${theme.name} (copia)`,
          layout: definition.layout,
          baseConfig: definition,
        }),
      });
      setThemeList((prev) => [...prev, created]);
      toast.success("Tema duplicado — ya está en la galería");
    } catch {
      toast.error("No se pudo duplicar el tema");
    }
  }

  async function handleToggleFavorite(themeKey: string) {
    const previous = favoriteThemeKeys;
    const next = previous.includes(themeKey)
      ? previous.filter((k) => k !== themeKey)
      : [...previous, themeKey];
    setFavoriteThemeKeys(next);
    try {
      await adminFetch(`/admin/themes/${themeKey}/favorite`, { method: "POST" });
    } catch {
      setFavoriteThemeKeys(previous);
      toast.error("No se pudo actualizar favoritos");
    }
  }

  const resolvedDefinition = getResolvedDefinition(
    appearance.theme?.key,
    appearance.theme?.layout,
    appearance.theme?.baseConfig,
  );
  const themeOverrides = (appearance.themeOverrides ?? {}) as ThemeOverrides;

  if (activeTab === "blocks") {
    return (
      <div className="glass grid overflow-hidden rounded-2xl lg:grid-cols-[220px_1fr]">
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

        <VisualEditorWorkspace
          profile={profile}
          appearance={appearance}
          linksManager={linksManager}
          device={device}
          onDeviceChange={setDevice}
          onPublish={handlePublish}
          onViewMessages={linksManager.setMessagesLink}
        />

        <SubmissionsDialog
          link={linksManager.messagesLink}
          onOpenChange={(open) => !open && linksManager.setMessagesLink(null)}
        />
      </div>
    );
  }

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
                  loading={uploadingAvatar}
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
                  loading={uploadingCover}
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

            <div className="flex flex-col gap-4 border-t border-border-subtle pt-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">SEO</p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="seoTitle">Título SEO</Label>
                <Input
                  id="seoTitle"
                  maxLength={70}
                  placeholder={profile.displayName || "Ej: Diseñador freelance en Ciudad de México"}
                  value={profile.seoTitle ?? ""}
                  onChange={(e) => setProfile({ ...profile, seoTitle: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Se ve como el título de la pestaña y al compartir tu enlace. {profile.seoTitle?.length ?? 0}/70
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="seoDescription">Descripción SEO</Label>
                <Textarea
                  id="seoDescription"
                  rows={2}
                  maxLength={160}
                  placeholder={profile.bio || "Una frase que resuma tu página para buscadores y redes."}
                  value={profile.seoDescription ?? ""}
                  onChange={(e) => setProfile({ ...profile, seoDescription: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{profile.seoDescription?.length ?? 0}/160</p>
              </div>
            </div>

            <Button onClick={handleSaveProfile} loading={savingProfile} className="w-fit">
              {savingProfile ? "Guardando…" : "Guardar perfil"}
            </Button>
          </>
        )}

        {activeTab === "gallery" && (
          <ThemeGallery
            themes={themeList}
            activeThemeId={appearance.themeId}
            favoriteThemeKeys={favoriteThemeKeys}
            onApply={handleApplyTheme}
            onToggleFavorite={handleToggleFavorite}
            onDuplicate={handleDuplicateTheme}
          />
        )}

        {activeTab === "theme" && (
          <>
            <FieldSelect
              id="theme"
              label="Plantilla"
              value={appearance.themeId}
              onChange={(value) => setAppearance({ ...appearance, themeId: value })}
              options={themeList.map((theme) => ({ value: theme.id, label: theme.name }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                id="primaryColor"
                label="Color principal"
                value={appearance.primaryColor ?? resolvedDefinition.colors.primary}
                onChange={(value) => setAppearance({ ...appearance, primaryColor: value })}
              />
              <ColorField
                id="backgroundColor"
                label="Color de fondo"
                value={appearance.backgroundColor ?? resolvedDefinition.colors.background}
                onChange={(value) => setAppearance({ ...appearance, backgroundColor: value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldSelect
                id="borderStyle"
                label="Estilo de borde"
                value={appearance.borderStyle ?? resolvedDefinition.cards.border}
                onChange={(value) => setAppearance({ ...appearance, borderStyle: value })}
                options={BORDER_STYLES}
              />
              <FieldSelect
                id="shadowStyle"
                label="Estilo de sombra"
                value={appearance.shadowStyle ?? resolvedDefinition.cards.shadow}
                onChange={(value) => setAppearance({ ...appearance, shadowStyle: value })}
                options={SHADOW_STYLES}
              />
            </div>
            <Button onClick={handleSaveAppearance} loading={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>

            <ThemeCustomizePanel
              definition={resolvedDefinition}
              overrides={themeOverrides}
              onPatch={handlePatchOverrides}
              onSaveAsTheme={handleSaveAsTheme}
              onDuplicateCurrent={() => handleDuplicateTheme(appearance.theme!)}
              onReset={handleResetOverrides}
            />
          </>
        )}

        {activeTab === "structure" && (
          <>
            <FieldSelect
              id="buttonStyle"
              label="Estilo de botones"
              value={appearance.buttonStyle ?? resolvedDefinition.buttons.shape}
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
              value={appearance.animation ?? resolvedDefinition.animations.entrance}
              onChange={(value) => setAppearance({ ...appearance, animation: value })}
              options={ANIMATIONS}
            />
            <Button onClick={handleSaveAppearance} loading={savingAppearance} className="w-fit">
              {savingAppearance ? "Guardando…" : "Guardar apariencia"}
            </Button>
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
          <ProfileView
            profile={profile}
            appearance={appearance}
            links={linksManager.links}
            previewDevice={device}
          />
        </PreviewFrame>
      </div>

      <SubmissionsDialog
        link={linksManager.messagesLink}
        onOpenChange={(open) => !open && linksManager.setMessagesLink(null)}
      />
    </div>
  );
}
