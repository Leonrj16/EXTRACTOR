"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, MessageCircle } from "lucide-react";
import { getBlockDefinition } from "@/components/blocks/registry";
import type { BlockStyleOverrides } from "@/components/blocks/types";
import { getResolvedDefinition, resolveTheme } from "@/themes/resolve-theme";
import type { ThemeOverrides } from "@/themes/types";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";

interface ProfileViewProps {
  profile: ProfileData;
  appearance: AppearanceData;
  links: LinkItem[];
  onLinkClick?: (link: LinkItem) => void;
  onContactSubmit?: (link: LinkItem, values: { name: string; email: string; message: string }) => Promise<void>;
  className?: string;
  /**
   * Only set by the design editor's simulated device frames. Those frames
   * fake a screen size with a CSS transform on a fixed-width box, so the
   * real `sm:`/`lg:` media queries `resolveResponsiveVisibility` emits
   * would evaluate against the *actual* browser viewport, not the
   * simulated one — wrong in the editor. Passing the selected device here
   * hides `hiddenOn` blocks explicitly in JS instead, only in that
   * context. The real public page never sets this and relies purely on
   * the CSS classes, which is correct there (a real visitor has a real
   * viewport).
   */
  previewDevice?: "desktop" | "tablet" | "mobile";
}

export function ProfileView({
  profile,
  appearance,
  links,
  onLinkClick,
  onContactSubmit,
  className,
  previewDevice,
}: ProfileViewProps) {
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
    entranceVariant: variants,
    buttonTreatment,
    background,
    glow,
  } = resolved;

  // isActive filtering is the component's own responsibility, not each
  // caller's — the public page route already queries only active links,
  // but the design editor's live preview passes every link (so hiding a
  // block updates instantly without a page refetch), so this must hold
  // here regardless of what the caller passes in.
  const visibleLinks = links.filter((link) => link.isActive);

  // Kinds tall/wide enough to deserve both grid columns instead of being
  // squeezed into one.
  const WIDE_TYPES: LinkItem["type"][] = ["VIDEO", "MUSIC", "FORM", "HERO", "PROFILE", "FOOTER", "LOCATION"];
  function isWide(link: LinkItem) {
    return layout === "grid" && WIDE_TYPES.includes(link.type);
  }

  return (
    <div
      className={`relative flex min-h-full flex-col items-center gap-6 overflow-hidden px-6 py-14 text-center ${className ?? ""}`}
      style={{
        ...background.style,
        color: primaryColor,
        fontFamily: fontFamilyCss,
        ...typographyStyle,
        backgroundImage: appearance.backgroundImage
          ? `url(${appearance.backgroundImage})`
          : background.style.backgroundImage,
        backgroundSize: "cover",
      }}
    >
      {background.decoration === "aurora" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-[-20%] top-[-15%] size-[70%] animate-[aurora-drift-1_22s_ease-in-out_infinite] rounded-full blur-[90px]"
            style={{ backgroundColor: `${primaryColor}40` }}
          />
          <div
            className="absolute right-[-20%] top-[5%] size-[65%] animate-[aurora-drift-2_26s_ease-in-out_infinite] rounded-full blur-[100px]"
            style={{ backgroundColor: `${secondaryColor}30` }}
          />
          <div
            className="absolute bottom-[-25%] left-[10%] size-[60%] animate-[aurora-drift-3_30s_ease-in-out_infinite] rounded-full blur-[100px]"
            style={{ backgroundColor: `${accentColor}20` }}
          />
        </div>
      )}

      {profile.coverUrl && (
        <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover opacity-70" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent, ${backgroundColor})` }}
          />
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className="relative z-10 h-24 w-24 overflow-hidden rounded-full border-2"
        style={{
          borderColor: primaryColor,
          boxShadow: glow ? `0 0 32px ${primaryColor}66` : undefined,
          marginTop: profile.coverUrl ? "1.5rem" : undefined,
        }}
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-black/10" />
        )}
      </motion.div>

      <div className="relative z-10">
        <h1 className="text-xl" style={{ fontWeight: headingWeight }}>
          {profile.displayName}
        </h1>
        {profile.bio && (
          <p className="mt-2 max-w-xs text-sm opacity-80" style={{ fontWeight: bodyWeight }}>
            {profile.bio}
          </p>
        )}
      </div>

      {(profile.location || profile.contactEmail || profile.whatsapp) && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 text-xs opacity-70">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {profile.location}
            </span>
          )}
          {profile.contactEmail && (
            <span className="flex items-center gap-1">
              <Mail className="size-3.5" />
              {profile.contactEmail}
            </span>
          )}
          {profile.whatsapp && (
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {profile.whatsapp}
            </span>
          )}
        </div>
      )}

      <div
        className={
          layout === "grid"
            ? "relative z-10 grid w-full max-w-sm grid-cols-2 gap-3"
            : "relative z-10 flex w-full max-w-sm flex-col gap-3"
        }
      >
        {visibleLinks.map((link, index) => {
          // Every LinkType kind has a registered block — this only stays
          // undefined for a stale value from before a type was migrated,
          // so it's skipped rather than crashing the whole page.
          const definition = getBlockDefinition(link.type);
          if (!definition) return null;
          const hiddenOn = (link.styleOverrides as BlockStyleOverrides | null)?.hiddenOn;
          if (previewDevice && hiddenOn?.includes(previewDevice)) return null;
          const Preview = definition.Preview;
          return (
            <div key={link.id} className={isWide(link) ? "col-span-2" : undefined}>
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
                }}
                index={index}
                onLinkClick={onLinkClick}
                onContactSubmit={onContactSubmit}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
