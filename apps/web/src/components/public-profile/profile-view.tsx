"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, MessageCircle } from "lucide-react";
import { resolveEntranceVariant } from "@/components/blocks/shared/animation-presets";
import { resolveBorderStyle, resolveShadowStyle } from "@/components/blocks/shared/style-resolver";
import { getBlockDefinition } from "@/components/blocks/registry";
import type { BlockStyleOverrides } from "@/components/blocks/types";
import type { LinkItem } from "@/types/link";
import type { AppearanceData, ProfileData } from "@/types/profile";

interface ProfileViewProps {
  profile: ProfileData;
  appearance: AppearanceData;
  links: LinkItem[];
  onLinkClick?: (link: LinkItem) => void;
  onContactSubmit?: (link: LinkItem, values: { name: string; email: string; message: string }) => Promise<void>;
  className?: string;
}

const BUTTON_RADIUS: Record<string, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
  square: "rounded-none",
};

// Taller block containers (form, product card, video/music fallback) can't
// use the same "pill" radius as a short link button — rounded-full on a tall
// box distorts into a lens/circle shape, so it's capped at a card-sized radius.
const CARD_RADIUS: Record<string, string> = {
  rounded: "rounded-xl",
  pill: "rounded-2xl",
  square: "rounded-none",
};

export function ProfileView({
  profile,
  appearance,
  links,
  onLinkClick,
  onContactSubmit,
  className,
}: ProfileViewProps) {
  const base = appearance.theme?.baseConfig ?? {};
  const primaryColor = appearance.primaryColor ?? base.primaryColor ?? "#111827";
  const backgroundColor = appearance.backgroundColor ?? base.backgroundColor ?? "#ffffff";
  const buttonStyle = appearance.buttonStyle ?? base.buttonStyle ?? "rounded";
  const fontFamily = appearance.fontFamily ?? base.fontFamily ?? "Inter";
  const animation = appearance.animation ?? base.animation ?? "fade";
  const layout = appearance.layout ?? appearance.theme?.layout ?? "list";
  const borderStyleKey = appearance.borderStyle ?? base.borderStyle ?? "subtle";
  const shadowStyleKey = appearance.shadowStyle ?? base.shadowStyle ?? "none";
  const radius = BUTTON_RADIUS[buttonStyle] ?? "rounded-xl";
  const cardRadius = CARD_RADIUS[buttonStyle] ?? "rounded-xl";
  const variants = resolveEntranceVariant(animation);
  const blockShadow = resolveShadowStyle(shadowStyleKey as BlockStyleOverrides["shadow"], primaryColor);
  const blockBorder = resolveBorderStyle(borderStyleKey as BlockStyleOverrides["border"], primaryColor);
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

  const isAurora = Boolean(base.aurora);

  return (
    <div
      className={`relative flex min-h-full flex-col items-center gap-6 overflow-hidden px-6 py-14 text-center ${className ?? ""}`}
      style={{
        backgroundColor,
        color: primaryColor,
        fontFamily,
        backgroundImage: appearance.backgroundImage ? `url(${appearance.backgroundImage})` : undefined,
        backgroundSize: "cover",
      }}
    >
      {isAurora && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-20%] top-[-15%] size-[70%] animate-[aurora-drift-1_22s_ease-in-out_infinite] rounded-full bg-brand-purple/40 blur-[90px]" />
          <div className="absolute right-[-20%] top-[5%] size-[65%] animate-[aurora-drift-2_26s_ease-in-out_infinite] rounded-full bg-brand-blue/30 blur-[100px]" />
          <div className="absolute bottom-[-25%] left-[10%] size-[60%] animate-[aurora-drift-3_30s_ease-in-out_infinite] rounded-full bg-brand-cyan/20 blur-[100px]" />
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
          boxShadow: isAurora ? `0 0 32px ${primaryColor}66` : undefined,
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
        <h1 className="text-xl font-semibold">{profile.displayName}</h1>
        {profile.bio && <p className="mt-2 max-w-xs text-sm opacity-80">{profile.bio}</p>}
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
          const Preview = definition.Preview;
          return (
            <div key={link.id} className={isWide(link) ? "col-span-2" : undefined}>
              <Preview
                link={link}
                meta={link.metadata ?? {}}
                styleOverrides={(link.styleOverrides ?? {}) as BlockStyleOverrides}
                theme={{ primaryColor, radius, cardRadius, pageBorder: blockBorder, pageShadow: blockShadow }}
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
