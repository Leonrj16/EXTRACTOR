"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  Palette,
  BarChart3,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/types/profile";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/links", label: "Enlaces", icon: Link2 },
  { href: "/admin/design", label: "Diseño", icon: Palette },
  { href: "/admin/analytics", label: "Analítica", icon: BarChart3 },
];

export function AdminSidebar({
  profile,
  onNavigate,
}: {
  profile: ProfileData;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="glass flex h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col rounded-3xl p-4 sm:h-[calc(100vh-2rem)]">
      <div className="mb-6 px-2 pt-1">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className="relative" onClick={onNavigate}>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-aura glow-purple-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
                )}
              >
                <Icon className="size-4.5" />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/[0.08] pt-3">
        <a
          href={`/${profile.username}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <ExternalLink className="size-4.5" />
          Ver página pública
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <LogOut className="size-4.5" />
          Cerrar sesión
        </button>

        <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-aura text-xs font-semibold text-white">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              profile.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
